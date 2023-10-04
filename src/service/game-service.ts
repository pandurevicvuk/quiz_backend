import { Server } from "socket.io";
import { PlayerDTO, RoomDTO } from "../dto/game-dto";
import { differenceInMilliseconds } from "date-fns";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../utils/interfaces";

var queue: PlayerDTO[] = [];
var rooms: any = {};

export function initializeSocket(server: any) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const { id, name, photo } = socket.handshake.query;

    if (!id || !name || !photo) {
      //DISCONNECT SOCKET MANUAL
      return;
    }

    const player: PlayerDTO = {
      id: id as unknown as number,
      name: name as unknown as string,
      photo: photo as unknown as string,
      socket: socket,
    };

    //
    console.log("queue: ", queue);
    queue.push(player);

    if (queue.length < 2) return;

    const p1 = queue.shift();
    const p2 = queue.shift();
    if (!p1 || !p2) return;

    const sortedUserIds = [p1.id, p2.id].sort();
    const roomName = sortedUserIds.join("_");
    rooms[roomName] = {
      initTime: new Date(),
      p1Time: null,
      p2Time: null,
    };

    p1.socket.emit("start_game", p2.name);
    p2.socket.emit("start_game", p1.name);

    p1.socket.on(roomName, (data) => {
      // Handle the message sent by player 1
      console.log("Player 1 sent a message:", data);

      const room: RoomDTO = rooms[roomName];
      room.p1Time = new Date();
      if (!room.p2Time) return;
      const p1TimeDiff = differenceInMilliseconds(room.p1Time, room.initTime);
      const p2TimeDiff = differenceInMilliseconds(room.p2Time, room.initTime);
      const formattedP1Time = (p1TimeDiff / 1000).toFixed(2) + " s";
      const formattedP2Time = (p2TimeDiff / 1000).toFixed(2) + " s";

      p1.socket.emit("game_update", {
        playerTime: formattedP1Time,
        opponentTime: formattedP2Time,
        question: "What is the most populated country?",
      });
      p2.socket.emit("game_update", {
        playerTime: formattedP2Time,
        opponentTime: formattedP1Time,
        question: "What is the most populated country?",
      });
      rooms[roomName] = {
        initTime: new Date(),
        p1Time: null,
        p2Time: null,
      };
    });

    p2.socket.on(roomName, (data) => {
      // Handle the message sent by player 2
      console.log("Player 2 sent a message:", data);

      const room: RoomDTO = rooms[roomName];
      room.p2Time = new Date();
      if (!room.p1Time) return;
      const p1TimeDiff = differenceInMilliseconds(room.p1Time, room.initTime);
      const p2TimeDiff = differenceInMilliseconds(room.p2Time, room.initTime);
      const formattedP1Time = (p1TimeDiff / 1000).toFixed(2) + " s";
      const formattedP2Time = (p2TimeDiff / 1000).toFixed(2) + " s";

      p1.socket.emit("game_update", {
        playerTime: formattedP1Time,
        opponentTime: formattedP2Time,
        question: "What is the most populated country?",
      });
      p2.socket.emit("game_update", {
        playerTime: formattedP2Time,
        opponentTime: formattedP1Time,
        question: "What is the most populated country?",
      });
      rooms[roomName] = {
        initTime: new Date(),
        p1Time: null,
        p2Time: null,
      };
    });

    socket.on("disconnect", (reason) => {
      console.log("***DISCONNECT***");
    });

    socket.on("disconnecting", (reason) => {
      console.log("***DISCONNECTING***");
      console.log("Reason:", reason);
      console.log("Rooms leaving:", socket.rooms);
    });
  });
}
