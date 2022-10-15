export enum RoomEvent {
  GAME_DATA_RECEIVED = 'game.data.received',
  PARTICIPANT_JOINED = 'participant.joined',
  PARTICIPANT_LEFT = 'participant.left',
  PARTICIPANT_READY = 'participant.ready',
  GAME_STARTED = 'game.started',
  GAME_ENDED = 'game.ended',
  GUESS_SUBMITTED = 'guess.submitted',
  PARTICIPANT_GUESSED = 'participant.guessed',
  LETTER_REVEALED = 'letter.revealed',
}

export type GameDataReceivedPayload = {
  id: string;
  username: string;
  maxPlayers: number;
  gameDurationSeconds: number;
  participants: {
    readyUsernames: string[];
    unreadyUsernames: string[];
  };
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

export type HiddenWord = (string | null)[];

export type GameStartedPayload = {
  hiddenWord: HiddenWord;
  //5 image urls
  imageUrls: string[];
};

export type GameEndedPayload = {
  revealedWord: string;
};

export type GuessSubmittedPayload = {
  username: string;
  guess: string;
};

export type ParticipantGuessedPayload = {
  username: string;
};

export type LetterRevealedPayload = {
  hiddenWord: HiddenWord;
};
