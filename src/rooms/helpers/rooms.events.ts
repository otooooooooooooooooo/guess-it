/**
 * List of events fired from the room game socket
 */
export enum RoomEvent {
  /**
   * Is fired when there is a problem while joining the room
   */
  CONNECTION_ERROR = 'connection.error',
  /**
   * Is fired to the newly joined participant
   */
  GAME_DATA_RECEIVED = 'game.data.received',
  /**
   * Is fired to everyone in the room
   */
  PARTICIPANT_JOINED = 'participant.joined',
  /**
   * Is fired to everyone in the room
   */
  PARTICIPANT_LEFT = 'participant.left',
  /**
   * Is fired to everyone in the room when the participant
   * sets ready
   */
  PARTICIPANT_READY = 'participant.ready',
  /**
   * Is fired to everyone in the room when a new game starts
   */
  GAME_STARTED = 'game.started',
  /**
   * Is fired to everyone in the room when the game ends
   */
  GAME_ENDED = 'game.ended',
  /**
   * Is fired to everyone when a participant submits
   * an incorrect guess
   */
  GUESS_SUBMITTED = 'guess.submitted',
  /**
   * Is fired to everyone when a participant submits
   * a correct guess
   */
  PARTICIPANT_GUESSED = 'participant.guessed',
  /**
   * Is fired to everyone during a game when a new letter is
   * revealed (Only if hints are enabled)
   */
  LETTER_REVEALED = 'letter.revealed',
  /**
   * Is fired to everyone during a game when a participant
   * adds a new custom word (Only if custom words mode is on)
   */
  WORD_ADDED = 'word.added',
}

/**
 * According payloads to room events
 */

export enum ConnectionErrorReason {
  KEY_NOT_PROVIDED = 'Key was not provided in socket query',
  WRONG_KEY = 'Room with provided key does not exist',
  GAME_IN_PROGRESS = 'Game in the room is in progress',
  ROOM_IS_FULL = 'Room is full',
}

export type ConnectionErrorPayload = {
  /**
   * Reason for failed socket connection
   */
  reason: ConnectionErrorReason;
};

type Participant = {
  username: string;
};

type ParticipantWithStatus = Participant & {
  isReady: boolean;
};

export type GameDataReceivedPayload = {
  /**
   * Id of the participant which
   * can be used to authorize
   * http requests
   */
  id: string;
  /**
   * Username of the participant that will be used
   * in other events (It can be different from the one that was
   * provided if the same username was already used)
   */
  username: string;
  /**
   * Maximum allowed players in the room
   */
  maxPlayers: number;
  /**
   * Game duration of each game round
   */
  gameDurationSeconds: number;
  /**
   * Whether or not word hints are enabled
   */
  hintsEnabled: boolean;
  /**
   * Is false if custom words mode is not active,
   * is current custom words count otherwise
   */
  customWords: false | number;
  /**
   * Current online in the room
   */
  participants: ParticipantWithStatus[];
};

export type ParticipantJoinedPayload = Participant;

export type ParticipantLeftPayload = Participant;

export type ParticipantReadyPayload = Participant;

/**
 * Array of the hidden word's characters.
 * Hidden characters are null
 */
export type HiddenWord = (string | null)[];

export type GameStartedPayload = {
  /**
   * Word to guess
   */
  hiddenWord: HiddenWord;
  /**
   * Image urls with hidden word's keyword
   */
  imageUrls: string[];
};

export type GameEndedPayload = {
  /**
   * Answer of the game
   */
  revealedWord: string;
};

export type GuessSubmittedPayload = Participant & {
  /**
   * Guess that was submitted
   */
  guess: string;
};

export type ParticipantGuessedPayload = Participant;

export type LetterRevealedPayload = {
  /**
   * New state of the hidden word with a new hint
   */
  hiddenWord: HiddenWord;
};

export type WordAddedPayload = {
  /**
   * New count of the custom words
   */
  wordCount: number;
};
