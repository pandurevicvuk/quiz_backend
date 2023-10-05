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
    startTimer(init.room, p1, p2);

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
      const instruction = await getGameInstruction(rooms[init.room.name]);
      p1.socket.emit("game_update", instruction.p1);
      p2.socket.emit("game_update", instruction.p2);
      clearTimeout(rooms[init.room.name].timer);
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
    timer: null,
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

const getTimesUpInstruction = async (
  room: RoomDTO
): Promise<GameInstructionDTO> => {
  const { question, answer } = await getQuestion();
  var formattedP1Time = "10:00";
  var formattedP2Time = "10:00";

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
    pt: formattedP1Time,
    ot: formattedP2Time,
    pa: room.p1answer === room.answer,
    oa: room.p2answer === room.answer,
  };
  const p2 = {
    question: question,
    pt: formattedP2Time,
    ot: formattedP1Time,
    pa: room.p2answer === room.answer,
    oa: room.p1answer === room.answer,
  };
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
    p1: p1,
    p2: p2,
  };
};

const startTimer = (room: RoomDTO, p1: PlayerDTO, p2: PlayerDTO) => {
  const timer = setTimeout(async () => {
    const instruction: GameInstructionDTO = await getTimesUpInstruction(
      rooms[room.name]
    );
    p1.socket.emit("game_update", instruction.p1);
    p2.socket.emit("game_update", instruction.p2);
    startTimer(rooms[room.name], p1, p2);
  }, 10000);

  rooms[room.name].timer = timer;
  rooms[room.name].initTime = new Date();
};
const getQuestion = async (): Promise<{ question: string; answer: string }> => {
  const letters = ["A", "B", "C"];
  const randomIndex = Math.floor(Math.random() * letters.length);
  const randomLetter = letters[randomIndex];

  return {
    question: `Question ${Math.floor(Math.random() * 1000)} `,
    answer: randomLetter,
  };
};

function formatTime(time: Date | null): string {
  if (time === null) {
    return "10:00";
  }

  const ss = String(time.getSeconds()).padStart(2, "0");
  const ms = String(time.getMilliseconds()).padStart(3, "0");
  return `${ss}:${ms}`;
}
