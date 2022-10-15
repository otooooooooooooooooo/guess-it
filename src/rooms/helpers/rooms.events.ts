export enum RoomEvent {
  CLIENT_ID = 'client.id',
  PARTICIPANT_JOINED = 'participant.joined',
  PARTICIPANT_LEFT = 'participant.left',
  PARTICIPANT_READY = 'participant.ready',
  GAME_STARTED = 'game.started',
  GAME_ENDED = 'game.ended',
}

export type ClientIdPayload = {
  id: string;
};

export type ParticipantJoinedPayload = {
  username: string;
};

export type ParticipantLeftPayload = {
  username: string;
};

export type ParticipantReadyPayload = {
  username: string;
};

export type GameStartedPayload = {
  wordToGuess: string;
};
