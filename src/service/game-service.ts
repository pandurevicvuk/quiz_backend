import { Server } from "socket.io";
import {
  GameInstructionDTO,
  PlayerDTO,
  PlayerInstructionDTO,
  RoomDTO,
} from "../dto/game-dto";
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
      //DISCONNECT SOCKET MANUALLY
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
      if (rooms[init.room.name].p1Time) return;

      rooms[init.room.name].p1Time = new Date();
      rooms[init.room.name].p1answer = data;

      if (!rooms[init.room.name].p2Time) return;

      //P1 ANSWERED LAST
      if (rooms[init.room.name].count >= 10) {
        return endGame(init.room.name, p1, p2);
      }
      const instruction = await getGameInstruction(rooms[init.room.name]);

      p1.socket.emit("game_update", instruction.p1);
      p2.socket.emit("game_update", instruction.p2);

      startTimer(rooms[init.room.name], p1, p2);
    });

    // HANDLE THE MESSAGE SENT BY P2
    p2.socket.on(init.room.name, async (data: string) => {
      if (rooms[init.room.name].p2Time) return;

      rooms[init.room.name].p2Time = new Date();
      rooms[init.room.name].p2answer = data;

      if (!rooms[init.room.name].p1Time) return;

      //P2 ANSWERED LAST
      if (rooms[init.room.name].count >= 10) {
        return endGame(init.room.name, p1, p2);
      }
      const instruction = await getGameInstruction(rooms[init.room.name]);

      p1.socket.emit("game_update", instruction.p1);
      p2.socket.emit("game_update", instruction.p2);

      startTimer(rooms[init.room.name], p1, p2);
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

//
//
//
//
//

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
    count: 1,
    p1Count: 0,
    p2Count: 0,
    p1Time: null,
    p2Time: null,
    p1answer: null,
    p2answer: null,
    timer: null,
  };
  rooms[roomName] = room;
  startTimer(room, p1, p2);
  return { room: room, question: initQuestion.question };
};

const getGameInstruction = async (
  room: RoomDTO
): Promise<GameInstructionDTO> => {
  const { question, answer } = await getQuestion();
  var formattedP1Time;
  var formattedP2Time;
  var isP1First = true;
  var isP2First = true;

  if (room.p1Time && room.p2Time) {
    isP1First = room.p1Time >= room.p2Time;
    isP2First = room.p1Time < room.p2Time;
  }

  const p1Won =
    (room.p1answer === room.answer && room.p2answer !== room.answer) ||
    (room.p1answer === room.answer &&
      room.p2answer === room.answer &&
      isP1First);
  const p2won =
    (room.p1answer !== room.answer && room.p2answer === room.answer) ||
    (room.p1answer === room.answer &&
      room.p2answer === room.answer &&
      isP2First);

  if (room.p1Time) {
    const p1TimeDiff = differenceInMilliseconds(room.p1Time!, room.initTime);
    formattedP1Time = (p1TimeDiff / 1000).toFixed(2);
  }
  if (room.p2Time) {
    const p2TimeDiff = differenceInMilliseconds(room.p2Time, room.initTime);
    formattedP2Time = (p2TimeDiff / 1000).toFixed(2);
  }

  const p1: PlayerInstructionDTO = {
    question: question,
    pt: formattedP1Time || "10:00",
    ot: formattedP2Time || "10:00",
    pa: p1Won,
    oa: p2won,
  };
  const p2 = {
    question: question,
    pt: formattedP2Time || "10:00",
    ot: formattedP1Time || "10:00",
    pa: p2won,
    oa: p1Won,
  };

  rooms[room.name].count++;
  rooms[room.name].answer = answer;
  if (p1Won) rooms[room.name].p1Count++;
  if (p2won) rooms[room.name].p2Count++;

  //reset room values
  rooms[room.name].initTime = new Date();
  rooms[room.name].p1Time = null;
  rooms[room.name].p2Time = null;
  rooms[room.name].p1answer = null;
  rooms[room.name].p2answer = null;

  return {
    p1: p1,
    p2: p2,
  };
};

const startTimer = (room: RoomDTO, p1: PlayerDTO, p2: PlayerDTO) => {
  //remove previous timer
  if (rooms[room.name].timer) clearTimeout(rooms[room.name].timer);

  const timer = setTimeout(async () => {
    if (rooms[room.name].count >= 10) return endGame(room.name, p1, p2);

    const instruction = await getGameInstruction(rooms[room.name]);
    p1.socket.emit("game_update", instruction.p1);
    p2.socket.emit("game_update", instruction.p2);
    startTimer(rooms[room.name], p1, p2);
  }, 10000);

  rooms[room.name].timer = timer;
  rooms[room.name].initTime = new Date();
};

const getQuestion = async (): Promise<{ question: string; answer: string }> => {
  const letters = ["A", "B"];
  const randomIndex = Math.floor(Math.random() * letters.length);
  const randomLetter = letters[randomIndex];

  return {
    question: `Question ${Math.floor(Math.random() * 1000)} `,
    answer: randomLetter,
  };
};

const endGame = (roomName: string, p1: PlayerDTO, p2: PlayerDTO) => {
  const p1Count = rooms[roomName].p1Count;
  const p2Count = rooms[roomName].p2Count;
  p1.socket.emit("game_end", { win: p1Count > p2Count });
  p2.socket.emit("game_end", { win: p2Count > p1Count });
  p1.socket.disconnect();
  p2.socket.disconnect();
  clearTimeout(rooms[roomName].timer);
  delete rooms[roomName];
};
