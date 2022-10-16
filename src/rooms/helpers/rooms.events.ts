/**
 * List of events fired from the room game socket
 */
export enum RoomEvent {
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
   * an correct guess
   */
  PARTICIPANT_GUESSED = 'participant.guessed',
  /**
   * Is fired to everyone during a game when a new letter is
   * revealed (Only if custom words mode is on)
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
  customWords: boolean | number;
  /**
   * Current online in the room
   */
  participants: {
    /**
     * Participants that marked as ready
     */
    readyUsernames: string[];
    /**
     * Participant that are not marked as ready
     */
    unreadyUsernames: string[];
  };
};

export type ParticipantJoinedPayload = {
  /**
   * Username of the joined participant
   */
  username: string;
};

export type ParticipantLeftPayload = {
  /**
   * Username of the participant that left
   */
  username: string;
};

export type ParticipantReadyPayload = {
  /**
   * Username of the participant that marked ready
   */
  username: string;
};

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

export type GuessSubmittedPayload = {
  /**
   * Username of the participant that submitted a guess
   */
  username: string;
  /**
   * Guess that was submitted
   */
  guess: string;
};

export type ParticipantGuessedPayload = {
  /**
   * Username of the participant that guessed the word
   */
  username: string;
};

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
