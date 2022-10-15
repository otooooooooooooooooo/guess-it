import { v4 as uuid } from 'uuid';
import { RoomDestroyer } from './rooms.interfaces';
import {
  GameStartedPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantReadyPayload,
  RoomEvent,
} from './rooms.events';
import { CustomException } from '../../exceptions/exceptions.custom-exception';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { WebsocketUser } from './rooms.user';
import { LoggingService } from '../../logging/logging.service';

export type RoomKey = string;

type GameRoomSettings = {
  size: number;
  minAmount: number;
  gameDurationSeconds: number;
};

const defaultSettings: GameRoomSettings = {
  gameDurationSeconds: 180,
  minAmount: 2,
  size: 5,
};

type GameRoomOptions = Partial<GameRoomSettings>;

enum GameState {
  WAITING,
  PLAYING,
}

class RoomParticipant {
  constructor(public readonly user: WebsocketUser) {}

  private _ready = false;

  public get ready(): boolean {
    return this._ready;
  }

  public set ready(value: boolean) {
    this._ready = value;
  }
}

export class GameRoom {
  private readonly settings: GameRoomSettings = defaultSettings;
  private readonly _key: RoomKey = uuid();
  private participants: RoomParticipant[] = [];
  private gameState: GameState = GameState.WAITING;

  constructor(
    private readonly roomDestroyer: RoomDestroyer,
    private readonly loggingService: LoggingService,
    options?: GameRoomOptions,
  ) {
    if (options)
      Object.keys(defaultSettings).forEach(
        (key) => (this.settings[key] = options[key] || defaultSettings[key]),
      );
  }

  public get key(): RoomKey {
    return this._key;
  }

  private isEmpty(): boolean {
    return this.participants === [];
  }

  private isFull(): boolean {
    return this.participants.length === this.settings.size;
  }

  private get activeParticipantsAmount(): number {
    return this.participants.length;
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
    if (this.isEmpty()) this.deactivate();
  }

  private onWaitingParticipantDisconnect(participant: RoomParticipant): void {
    console.log(
      `Waiting participant disconnected. id - ${participant.user.id}`,
    );
    this.onDisconnect(participant);
    this.startGameIfAllReady();
  }

  private allReady(): boolean {
    return (
      this.participants.length >= this.settings.minAmount &&
      this.participants.every((p) => p.ready)
    );
  }

  private onPlayingParticipantDisconnect(participant: RoomParticipant): void {
    console.log(
      `Playing participant disconnected. id - ${participant.user.id}`,
    );
    this.onDisconnect(participant);
    //TODO
  }

  private static generateRandomSuffix(): string {
    return (Math.floor(Math.random() * 10000) + 1000).toString();
  }

  private addParticipant(participant: RoomParticipant): void {
    console.log('Adding participant');
    if (!participant.user.username) participant.user.username = 'Guest';
    if (
      this.participants.some(
        (p) => p.user.username === participant.user.username,
      )
    )
      participant.user.username =
        participant.user.username + GameRoom.generateRandomSuffix();

    this.participants.push(participant);
    this.emitToAll(RoomEvent.PARTICIPANT_JOINED, {
      username: participant.user.username,
    } as ParticipantJoinedPayload);
    participant.user.onDisconnect(() => {
      this.onWaitingParticipantDisconnect(participant);
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
    participant.ready = true;
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

  private startGame(): void {
    this.gameState = GameState.PLAYING;

    this.participants.forEach((p) =>
      p.user.onDisconnect(() => this.onPlayingParticipantDisconnect(p)),
    );

    const wordToGuess = 'cat'; //TODO generate randomly

    this.emitToAll(RoomEvent.GAME_STARTED, {
      wordToGuess: wordToGuess,
    } as GameStartedPayload);
  }

  private emitToAll(event: RoomEvent, payload: any) {
    this.participants.forEach((p) => p.user.emit(event, payload));
  }

  private deactivate(): void {
    this.roomDestroyer(this);
  }
}
