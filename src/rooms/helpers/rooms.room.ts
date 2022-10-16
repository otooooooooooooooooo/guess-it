import { v4 as uuid } from 'uuid';
import { RoomDestroyer } from './rooms.interfaces';
import {
  GameDataReceivedPayload,
  GameEndedPayload,
  GameStartedPayload,
  GuessSubmittedPayload,
  HiddenWord,
  LetterRevealedPayload,
  ParticipantGuessedPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantReadyPayload,
  RoomEvent,
  WordAddedPayload,
} from './rooms.events';
import { CustomException } from '../../exceptions/exceptions.custom-exception';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { WebsocketUser } from './rooms.user';
import { LoggingService } from '../../logging/logging.service';
import { clearTimeout } from 'timers';
import { WordsService } from '../../words/service/words.service';
import { ImagesService } from '../../images/service/images.service';

export type RoomKey = string;

type RoomSettings = {
  deleteAfterInactiveSeconds: number;
  maxPlayers: number;
  gameDurationSeconds: number;
  disableHints: boolean;
  customWords: boolean;
};

export const defaultSettings: RoomSettings = {
  deleteAfterInactiveSeconds: 30,
  gameDurationSeconds: 60,
  maxPlayers: 5,
  disableHints: false,
  customWords: false,
};

export type RoomOptions = Partial<RoomSettings>;

enum RoomState {
  WAITING,
  PLAYING,
}

enum RoomParticipantStatus {
  WAITING,
  READY,
  GUESSED,
}

class RoomParticipant {
  constructor(public readonly user: WebsocketUser) {}

  private _status = RoomParticipantStatus.WAITING;

  public get status(): RoomParticipantStatus {
    return this._status;
  }

  public set status(value: RoomParticipantStatus) {
    this._status = value;
  }
}

export class Room {
  private readonly settings: RoomSettings = defaultSettings;
  private readonly _key: RoomKey = uuid();
  private participants: RoomParticipant[] = [];
  private roomState: RoomState;
  private wordToGuess: string;
  private hiddenWord: HiddenWord;
  private gameEndTimeout: NodeJS.Timeout;
  private hintTimeout: NodeJS.Timeout;
  private readonly deactivationTimeout: NodeJS.Timeout;
  private readonly customWords: string[] = [];

  public get deactivationTimeSeconds(): number {
    return this.settings.deleteAfterInactiveSeconds;
  }

  constructor(
    private readonly roomDestroyer: RoomDestroyer,
    private readonly loggingService: LoggingService,
    private readonly wordsService: WordsService,
    private readonly imagesService: ImagesService,
    options: RoomOptions,
  ) {
    if (options)
      Object.keys(defaultSettings).forEach(
        (key) => (this.settings[key] = options[key] || defaultSettings[key]),
      );
    this.setInitialGameState();

    const that = this;
    this.deactivationTimeout = setTimeout(() => {
      this.loggingService.info('Initiated scheduled check', { key: this._key });
      that.ifEmptyDeactivate();
    }, this.settings.deleteAfterInactiveSeconds * 1000);
  }

  public get key(): RoomKey {
    return this._key;
  }

  private isEmpty(): boolean {
    return this.participants.length === 0;
  }

  private isFull(): boolean {
    return this.participants.length === this.settings.maxPlayers;
  }

  public join(user: WebsocketUser): boolean {
    this.loggingService.info('Trying to join participant', { id: user.id });
    if (this.roomState !== RoomState.WAITING || this.isFull()) return false;
    this.addParticipant(new RoomParticipant(user));
    return true;
  }

  private removeFromList(participant: RoomParticipant) {
    this.participants = this.participants.filter(
      (p) => p.user.id !== participant.user.id,
    );
  }

  private onDisconnect(participant: RoomParticipant): void {
    this.removeFromList(participant);
    this.emitToAll(RoomEvent.PARTICIPANT_LEFT, {
      username: participant.user.username,
    } as ParticipantLeftPayload);
    this.ifEmptyDeactivate();
    if (participant.status === RoomParticipantStatus.WAITING) {
      this.startGameIfAllReady();
      return;
    }
    if (
      this.roomState === RoomState.PLAYING &&
      participant.status !== RoomParticipantStatus.GUESSED
    )
      this.ifAllGuessedEndGame.bind(this)();
  }

  private ifEmptyDeactivate(): void {
    this.loggingService.info('Checking if room is empty', { key: this.key });
    if (this.isEmpty()) this.deactivate();
  }

  private allReady(): boolean {
    return (
      this.participants.length >= 2 &&
      this.participants.every((p) => p.status === RoomParticipantStatus.READY)
    );
  }

  private allGuessed(): boolean {
    return this.participants.every(
      (p) => p.status === RoomParticipantStatus.GUESSED,
    );
  }

  private setName(participant: RoomParticipant): void {
    if (!participant.user.username) participant.user.username = 'Guest';
    if (
      this.participants.some(
        (p) => p.user.username === participant.user.username,
      )
    )
      participant.user.username += WordsService.getRandomSuffix();
  }

  private sendCredentials(participant: RoomParticipant): void {
    participant.user.emit(RoomEvent.GAME_DATA_RECEIVED, {
      id: participant.user.id,
      username: participant.user.username,
      maxPlayers: this.settings.maxPlayers,
      gameDurationSeconds: this.settings.gameDurationSeconds,
      hintsEnabled: !this.settings.disableHints,
      customWords: this.settings.customWords ? this.customWords.length : false,
      participants: {
        readyUsernames: this.participants
          .filter((p) => p.status === RoomParticipantStatus.READY)
          .map((p) => p.user.username),
        unreadyUsernames: this.participants
          .filter((p) => p.status !== RoomParticipantStatus.READY)
          .map((p) => p.user.username),
      },
    } as GameDataReceivedPayload);
  }

  private addParticipant(participant: RoomParticipant): void {
    console.log('Adding participant');
    clearTimeout(this.deactivationTimeout);
    this.setName(participant);
    this.participants.push(participant);
    this.sendCredentials(participant);
    this.emitToAll(RoomEvent.PARTICIPANT_JOINED, {
      username: participant.user.username,
    } as ParticipantJoinedPayload);
    participant.user.onDisconnect(() => {
      this.onDisconnect.bind(this)(participant);
    });
  }

  public setReady(id: string): void {
    const participant: RoomParticipant = this.findParticipantById(id);
    if (!participant)
      throw new CustomException(CustomExceptionType.WRONG_ID, { id: id });
    if (this.roomState === RoomState.PLAYING)
      throw new CustomException(CustomExceptionType.GAME_ALREADY_STARTED, {
        key: this.key,
      });
    participant.status = RoomParticipantStatus.READY;
    this.emitToAll(RoomEvent.PARTICIPANT_READY, {
      username: participant.user.username,
    } as ParticipantReadyPayload);
    this.startGameIfAllReady();
  }

  private wordListReady(): boolean {
    return !this.settings.customWords || this.customWords.length !== 0;
  }

  private startGameIfAllReady(): void {
    if (this.allReady() && this.wordListReady()) this.startGame().then();
  }

  private findParticipantById(id: string): RoomParticipant | undefined {
    console.log(this.participants);
    return this.participants.find((p) => p.user.id === id) || undefined;
  }

  private sendHint(): void {
    this.hiddenWord = this.wordsService.getHint(
      this.wordToGuess,
      this.hiddenWord,
    );
    this.emitToAll(RoomEvent.LETTER_REVEALED, {
      hiddenWord: this.hiddenWord,
    } as LetterRevealedPayload);
    this.setHintTimeout();
  }

  private setHintTimeout(): void {
    //Game should reveal only half of the character throughout the game
    const timeMs: number =
      (this.settings.gameDurationSeconds / (this.wordToGuess.length / 2)) *
      1000;
    this.hintTimeout = setTimeout(this.sendHint.bind(this), timeMs);
  }

  private async startGame(): Promise<void> {
    this.roomState = RoomState.PLAYING;
    this.setWordToGuess();
    const imageUrls: string[] = await this.imagesService.getImageUrls(
      this.wordToGuess,
    );
    if (!this.settings.disableHints) this.setHintTimeout();

    this.emitToAll(RoomEvent.GAME_STARTED, {
      hiddenWord: this.hiddenWord,
      imageUrls: imageUrls,
    } as GameStartedPayload);

    this.gameEndTimeout = setTimeout(
      this.endGame.bind(this),
      this.settings.gameDurationSeconds * 1000,
    );
  }

  private setWordToGuess(): void {
    console.log(this.customWords);
    const { word, hiddenWord }: { word: string; hiddenWord: HiddenWord } =
      this.wordsService.getRandomWord(
        this.settings.customWords ? this.customWords : undefined,
      );
    this.wordToGuess = word;
    this.hiddenWord = hiddenWord;
  }

  private ifAllGuessedEndGame(): void {
    if (this.allGuessed()) this.endGame();
  }

  public guess(id: string, guess: string): boolean {
    const participant: RoomParticipant = this.findParticipantById(id);
    if (!participant)
      throw new CustomException(CustomExceptionType.WRONG_ID, { id: id });

    if (this.roomState !== RoomState.PLAYING)
      throw new CustomException(CustomExceptionType.GAME_NOT_STARTED, {
        id: id,
        key: this.key,
      });

    if (participant.status === RoomParticipantStatus.GUESSED)
      throw new CustomException(CustomExceptionType.ALREADY_GUESSED, {
        id: id,
      });

    const {
      formattedGuess,
      matches,
    }: { formattedGuess: string; matches: boolean } = this.wordsService.matches(
      guess,
      this.wordToGuess,
    );
    if (matches) {
      participant.status = RoomParticipantStatus.GUESSED;
      this.emitToAll(RoomEvent.PARTICIPANT_GUESSED, {
        username: participant.user.username,
      } as ParticipantGuessedPayload);
      this.ifAllGuessedEndGame();
      return true;
    }

    this.emitToAll(RoomEvent.GUESS_SUBMITTED, {
      username: participant.user.username,
      guess: formattedGuess,
    } as GuessSubmittedPayload);
    return false;
  }

  private setInitialGameState(): void {
    this.roomState = RoomState.WAITING;
    this.wordToGuess = null;
    this.hiddenWord = null;
    this.participants.forEach(
      (p) => (p.status = RoomParticipantStatus.WAITING),
    );
  }

  private endGame(): void {
    clearTimeout(this.gameEndTimeout);
    clearTimeout(this.hintTimeout);
    this.emitToAll(RoomEvent.GAME_ENDED, {
      revealedWord: this.wordToGuess,
    } as GameEndedPayload);
    this.setInitialGameState();
  }

  private emitToAll(event: RoomEvent, payload: any) {
    this.participants.forEach((p) => p.user.emit(event, payload));
  }

  private deactivate(): void {
    this.loggingService.info('Deactivating room ', { key: this.key });
    this.roomDestroyer(this);
  }

  addCustomWord(id: string, word: string) {
    const participant: RoomParticipant = this.findParticipantById(id);
    if (!participant)
      throw new CustomException(CustomExceptionType.WRONG_ID, { id: id });
    if (!this.settings.customWords)
      throw new CustomException(CustomExceptionType.NOT_CUSTOM_MODE, {
        id: id,
        key: this.key,
      });
    this.customWords.push(word);
    this.emitToAll(RoomEvent.WORD_ADDED, {
      wordCount: this.customWords.length,
    } as WordAddedPayload);
    this.startGameIfAllReady();
  }
}
