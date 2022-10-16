import { Room } from './rooms.room';

/**
 * Interface of the function that is passed to the room.
 * Room will call it before it deactivates itself.
 */
export type RoomDestroyer = (room: Room) => void;
