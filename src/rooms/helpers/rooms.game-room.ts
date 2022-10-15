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
} from './rooms.events';
import { CustomException } from '../../exceptions/exceptions.custom-exception';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { WebsocketUser } from './rooms.user';
import { LoggingService } from '../../logging/logging.service';
import { clearTimeout } from 'timers';
import axios from 'axios';
import { config } from '../../config/config';
import { words } from '../../words/words';

export type RoomKey = string;

type GameRoomSettings = {
  deleteAfterInactiveSeconds: number;
  maxPlayers: number;
  gameDurationSeconds: number;
  disableHints: boolean;
};

export const defaultSettings: GameRoomSettings = {
  deleteAfterInactiveSeconds: 30,
  gameDurationSeconds: 60,
  maxPlayers: 5,
  disableHints: false,
};

export type GameRoomOptions = Partial<GameRoomSettings>;

enum GameState {
  WAITING,
  PLAYING,
}

enum ParticipantStatus {
  WAITING,
  READY,
  GUESSED,
}

class RoomParticipant {
  constructor(public readonly user: WebsocketUser) {}

  private _status = ParticipantStatus.WAITING;

  public get status(): ParticipantStatus {
    return this._status;
  }

  public set status(value: ParticipantStatus) {
    this._status = value;
  }
}

export class GameRoom {
  private readonly settings: GameRoomSettings = defaultSettings;
  private readonly _key: RoomKey = uuid();
  private participants: RoomParticipant[] = [];
  private gameState: GameState;
  private wordToGuess: string;
  private hiddenWord: HiddenWord;
  private readonly shownCharacters: string[] = [' ', '-', '_', '&'];
  private gameEndTimeout: NodeJS.Timeout;
  private hintTimeout: NodeJS.Timeout;
  private readonly deactivationTimeout: NodeJS.Timeout;

  public get deactivationTimeSeconds(): number {
    return this.settings.deleteAfterInactiveSeconds;
  }

  constructor(
    private readonly roomDestroyer: RoomDestroyer,
    private readonly loggingService: LoggingService,
    options: GameRoomOptions,
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
    if (this.gameState !== GameState.WAITING || this.isFull()) return false;
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
    if (participant.status === ParticipantStatus.WAITING) {
      this.startGameIfAllReady();
      return;
    }
    if (
      this.gameState === GameState.PLAYING &&
      participant.status !== ParticipantStatus.GUESSED
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
      this.participants.every((p) => p.status === ParticipantStatus.READY)
    );
  }

  private allGuessed(): boolean {
    return this.participants.every(
      (p) => p.status === ParticipantStatus.GUESSED,
    );
  }

  private static generateRandomSuffix(): string {
    return (Math.floor(Math.random() * 10000) + 1000).toString();
  }

  private setName(participant: RoomParticipant): void {
    if (!participant.user.username) participant.user.username = 'Guest';
    if (
      this.participants.some(
        (p) => p.user.username === participant.user.username,
      )
    )
      participant.user.username =
        participant.user.username + GameRoom.generateRandomSuffix();
  }

  private sendCredentials(participant: RoomParticipant): void {
    participant.user.emit(RoomEvent.GAME_DATA_RECEIVED, {
      id: participant.user.id,
      username: participant.user.username,
      maxPlayers: this.settings.maxPlayers,
      gameDurationSeconds: this.settings.gameDurationSeconds,
      participants: {
        readyUsernames: this.participants
          .filter((p) => p.status === ParticipantStatus.READY)
          .map((p) => p.user.username),
        unreadyUsernames: this.participants
          .filter((p) => p.status !== ParticipantStatus.READY)
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
    if (this.gameState === GameState.PLAYING)
      throw new CustomException(CustomExceptionType.GAME_ALREADY_STARTED, {
        key: this.key,
      });
    participant.status = ParticipantStatus.READY;
    this.emitToAll(RoomEvent.PARTICIPANT_READY, {
      username: participant.user.username,
    } as ParticipantReadyPayload);
    this.startGameIfAllReady();
  }

  private startGameIfAllReady(): void {
    if (this.allReady()) this.startGame();
  }

  private findParticipantById(id: string): RoomParticipant | undefined {
    console.log(this.participants);
    return this.participants.find((p) => p.user.id === id) || undefined;
  }

  private sendHint(): void {
    const hiddenIndexes: number[] = this.hiddenWord
      .map((val, index) => (!val ? index : null))
      .filter((v) => v !== null);

    const randomIndexToReveal: number =
      hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];

    this.hiddenWord[randomIndexToReveal] =
      this.wordToGuess[randomIndexToReveal];
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

  private getImageUrls(): Promise<string[]> {
    console.log(this.wordToGuess);
    //Documentation https://serpapi.com/images-results
    //random query to avoid caching idk why
    return axios
      .get(`https://serpapi.com/search?z=${Math.random()}`, {
        data: {
          q: this.wordToGuess,
          tbm: 'isch', //to fetch images
          api_key: config.API_KEY,
          no_cache: true,
        },
      })
      .then((res) =>
        res.data['images_results']
          .slice(0, 5)
          .map((search) => search['thumbnail']),
      );
  }

  private async startGame(): Promise<void> {
    this.gameState = GameState.PLAYING;

    this.generateWordToGuess();

    const imageUrls: string[] = await this.getImageUrls();

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

  private generateWordToGuess(): void {
    this.wordToGuess = words[Math.floor(Math.random() * words.length)];
    this.loggingService.info('Generated a word', {
      word: this.wordToGuess,
      key: this.key,
    });
    this.hiddenWord = this.wordToGuess
      .split('')
      .map((char) => (this.shownCharacters.includes(char) ? char : null));
  }

  private ifAllGuessedEndGame(): void {
    if (this.allGuessed()) this.endGame();
  }

  public guess(id: string, guess: string): boolean {
    const participant: RoomParticipant = this.findParticipantById(id);
    if (!participant)
      throw new CustomException(CustomExceptionType.WRONG_ID, { id: id });

    if (this.gameState !== GameState.PLAYING)
      throw new CustomException(CustomExceptionType.GAME_NOT_STARTED, {
        id: id,
        key: this.key,
      });

    if (participant.status === ParticipantStatus.GUESSED)
      throw new CustomException(CustomExceptionType.ALREADY_GUESSED, {
        id: id,
      });

    const formattedGuess: string = guess.replace('%20', ' ');
    if (this.wordToGuess === formattedGuess) {
      participant.status = ParticipantStatus.GUESSED;
      this.emitToAll(RoomEvent.PARTICIPANT_GUESSED, {
        username: participant.user.username,
      } as ParticipantGuessedPayload);
      this.ifAllGuessedEndGame();
      return true;
    }
    console.log('guess ' + formattedGuess + ' was wrong.');
    this.emitToAll(RoomEvent.GUESS_SUBMITTED, {
      username: participant.user.username,
      guess: guess,
    } as GuessSubmittedPayload);
    return false;
  }

  private setInitialGameState(): void {
    this.gameState = GameState.WAITING;
    this.wordToGuess = null;
    this.hiddenWord = null;
    this.participants.forEach((p) => (p.status = ParticipantStatus.WAITING));
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
}
