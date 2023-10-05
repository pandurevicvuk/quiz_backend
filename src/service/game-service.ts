import { Server } from "socket.io";
import { GameInstructionDTO, PlayerDTO, RoomDTO } from "../dto/game-dto";
import { differenceInMilliseconds } from "date-fns";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../utils/interfaces";
import { log } from "console";

var queue: PlayerDTO[] = [];
var rooms: any = {};

export function initializeSocket(server: any) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { cors: { origin: "*" } });

  io.on("connection", async (socket) => {
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
    queue.push(player);

    if (queue.length < 2) return;

    const p1 = queue.shift();
    const p2 = queue.shift();
    if (!p1 || !p2) return;

    const init = await createGameRoom(p1, p2);

    p1.socket.emit("start_game", {
      roomName: init.room.name,
      question: init.question,
    });
    p2.socket.emit("start_game", {
      roomName: init.room.name,
      question: init.question,
    });

    // HANDLE THE MESSAGE SENT BY P1
    p1.socket.on(init.room.name, async (data: string) => {
      const room: RoomDTO = rooms[init.room.name];

      if (room.p1Time) return;

      room.p1Time = new Date();
      room.p1answer = data;
      if (!room.p2Time) return;

      const instruction = await getGameInstruction(room);
      p1.socket.emit("game_update", instruction.p1);
      p2.socket.emit("game_update", instruction.p2);
    });

    // HANDLE THE MESSAGE SENT BY P2
    p2.socket.on(init.room.name, async (data: string) => {
      const room: RoomDTO = rooms[init.room.name];

      if (room.p2Time) return;

      room.p2Time = new Date();
      room.p2answer = data;
      if (!room.p1Time) return;

      const instruction = await getGameInstruction(room);
      p1.socket.emit("game_update", instruction.p1);
      p2.socket.emit("game_update", instruction.p2);
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

const createGameRoom = async (
  p1: PlayerDTO,
  p2: PlayerDTO
): Promise<{ room: RoomDTO; question: string }> => {
  const sortedUserIds = [p1.id, p2.id].sort();
  const roomName = sortedUserIds.join("_");

  const initQuestion = await getQuestion();

  const room: RoomDTO = {
    name: roomName,
    initTime: new Date(),
    answer: initQuestion.answer,
    p1Time: null,
    p2Time: null,
    p1answer: null,
    p2answer: null,
  };
  rooms[roomName] = room;
  return { room: room, question: initQuestion.question };
};

const getGameInstruction = async (
  room: RoomDTO
): Promise<GameInstructionDTO> => {
  const p1TimeDiff = differenceInMilliseconds(
    room.p1Time ?? new Date(),
    room.initTime
  );
  const p2TimeDiff = differenceInMilliseconds(
    room.p2Time ?? new Date(),
    room.initTime
  );
  const formattedP1Time = (p1TimeDiff / 1000).toFixed(2);
  const formattedP2Time = (p2TimeDiff / 1000).toFixed(2);

  const { question, answer } = await getQuestion();

  rooms[room.name] = {
    name: room.name,
    initTime: new Date(),
    answer: answer,
    p1Time: null,
    p2Time: null,
    p1answer: null,
    p2answer: null,
  };

  return {
    p1: {
      question: question,
      pt: formattedP1Time,
      ot: formattedP2Time,
      pa: room.answer === room.p1answer,
      oa: room.answer === room.p2answer,
    },
    p2: {
      question: question,
      pt: formattedP2Time,
      ot: formattedP1Time,
      pa: room.answer === room.p2answer,
      oa: room.answer === room.p1answer,
    },
  };
};

const getQuestion = async (): Promise<{ question: string; answer: string }> => {
  const letters = ["A", "B", "C"];
  const randomIndex = Math.floor(Math.random() * letters.length);
  const randomLetter = letters[randomIndex];

  return { question: "Question Random", answer: randomLetter };
};
