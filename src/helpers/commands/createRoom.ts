import storage from "../storage";
import { IRoom } from "../types";

export const createRoom = (userName: string, userId: number): IRoom => {
    const existingRoom = storage.rooms.find(
      (r) =>
        r.roomUsers.length === 1 && r.roomUsers.some((u) => u.userId === userId)
    );
  
    if (existingRoom) {
      throw new Error(
        `Error while trying to create new room for user ${userName}`
      );
    }
  
    const room = {
      roomId: storage.roomId++,
      roomUsers: [{ name: userName, userId }],
    };
    storage.rooms.push(room);
    return room;
  };