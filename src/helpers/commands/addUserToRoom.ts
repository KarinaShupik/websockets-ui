import storage from "../storage";
import { createGame } from "./createGame";

export const addUserToRoom = (roomId: number, indexUser: number) => {
    const room = storage.rooms.find((r) => r.roomId === roomId);
    if (
      !room ||
      room.roomUsers.length != 1 ||
      room.roomUsers.some((u) => u.userId === indexUser)
    ) {
      throw new Error(
        `Error while trying to add user ${indexUser} to the room ${roomId}`
      );
    }
    const user = storage.users.find((u) => u.userId === indexUser);
    if (!user) {
      throw new Error(`User ${indexUser} is not found`);
    }
    const [user1] = room.roomUsers;
    const user2 = user;
    storage.rooms = storage.rooms.filter((r) => r.roomId !== room.roomId);
  
    return createGame(user1.userId, user2.userId);
  };