import { Server } from "socket.io";
import {
  GameInstructionDTO,
  PlayerDTO,
  PlayerResultDTO,
  QuestionDTO,
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
    const { id } = socket.handshake.query;
    if (!id) return socket.disconnect();

    //logic to get player from DB

    const player: PlayerDTO = {
      id: id as unknown as number,
      name: `Ime ${queue.length + 1}`,
      photo:
        queue.length === 0
          ? "https://picsum.photos/250?image=9"
          : "https://picsum.photos/250?image=24",
      socket: socket,
    };

    //
    queue.push(player);

    socket.on("disconnect", (reason) => {
      const opponentSocket = io.sockets.sockets.get(
        socket.data.opponentSocketId
      );

      if (
        opponentSocket &&
        opponentSocket.connected &&
        reason == "client namespace disconnect"
      ) {
        opponentSocket.emit("game_end", {
          message: "OPPONENT_LEFT",
          ps: 0,
          os: 0,
        });
        opponentSocket.disconnect();
        clearTimeout(rooms[socket.data.roomName].timer);
        delete rooms[socket.data.roomName];
      }
    });

    if (queue.length < 2) return;

    const p1 = queue.shift();
    const p2 = queue.shift();
    if (!p1 || !p2) return;

    const init = await createGameRoom(p1, p2);

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
      const result = await getRoundResult(rooms[init.room.name]);
      p1.socket.emit("round_result", result.p1);
      p2.socket.emit("round_result", result.p2);
      await new Promise((resolve) => setTimeout(resolve, 4000));

      const question = rooms[init.room.name].questions.pop();
      p1.socket.emit("round_question", {
        ...question,
        qc: rooms[init.room.name].count,
      });
      p2.socket.emit("round_question", {
        ...question,
        qc: rooms[init.room.name].count,
      });
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
      const result = await getRoundResult(rooms[init.room.name]);

      p1.socket.emit("round_result", result.p1);
      p2.socket.emit("round_result", result.p2);
      await new Promise((resolve) => setTimeout(resolve, 4000));

      const question = rooms[init.room.name].questions.pop();
      p1.socket.emit("round_question", {
        ...question,
        qc: rooms[init.room.name].count,
      });
      p2.socket.emit("round_question", {
        ...question,
        qc: rooms[init.room.name].count,
      });

      startTimer(rooms[init.room.name], p1, p2);
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
): Promise<{ room: RoomDTO; question: any }> => {
  const sortedUserIds = [p1.id, p2.id].sort();
  const roomName = sortedUserIds.join("_");

  //logic for retrieving not answered questions for players
  //for now dummy data is used
  //...

  const room: RoomDTO = {
    name: roomName,
    initTime: new Date(),
    count: 1,
    p1Count: 0,
    p2Count: 0,
    p1Time: null,
    p2Time: null,
    p1answer: null,
    p2answer: null,
    timer: null,
    questions: [
      {
        q: "Who wrote the famous play 'Romeo and Juliet'?",
        a: "William Shakespeare",
        b: "Charles Dickens",
        c: "Jane Austen",
      },
      {
        q: "What year did the Titanic sink?",
        a: "1912",
        b: "1920",
        c: "1905",
      },
      {
        q: "Which U.S. president issued the Emancipation Proclamation?",
        a: "Abraham Lincoln",
        b: "George Washington",
        c: "Thomas Jefferson",
      },
      {
        q: "Which Beatles album is often considered their masterpiece?",
        a: "Sgt. Pepper's Lonely Hearts Club Band",
        b: "Abbey Road",
        c: "Revolver",
      },
      {
        q: "Who was known as the 'King of Pop'?",
        a: "Michael Jackson",
        b: "Elvis Presley",
        c: "Frank Sinatra",
      },
      {
        q: "Who wrote the famous play 'Romeo and Juliet'?",
        a: "William Shakespeare",
        b: "Charles Dickens",
        c: "Jane Austen",
      },
      {
        q: "What year did the Titanic sink?",
        a: "1912",
        b: "1920",
        c: "1905",
      },
      {
        q: "Which U.S. president issued the Emancipation Proclamation?",
        a: "Abraham Lincoln",
        b: "George Washington",
        c: "Thomas Jefferson",
      },
      {
        q: "Which Beatles album is often considered their masterpiece?",
        a: "Sgt. Pepper's Lonely Hearts Club Band",
        b: "Abbey Road",
        c: "Revolver",
      },
      {
        q: "Who was known as the 'King of Pop'?",
        a: "Michael Jackson",
        b: "Elvis Presley",
        c: "Frank Sinatra",
      },
    ],
  };
  rooms[roomName] = room;

  p1.socket.data.roomName = room.name;
  p1.socket.data.opponentSocketId = p2.socket.id;
  p1.socket.emit("game_start", {
    t: "RED",
    rn: room.name,
    on: p2.name,
    op: p2.photo,
    pn: p1.name,
    pp: p1.photo,
  });
  p2.socket.data.roomName = room.name;
  p2.socket.data.opponentSocketId = p1.socket.id;
  p2.socket.emit("game_start", {
    t: "BLUE",
    rn: room.name,
    on: p1.name,
    op: p1.photo,
    pn: p2.name,
    pp: p2.photo,
  });
  await new Promise((resolve) => setTimeout(resolve, 8000));
  const question = rooms[roomName].questions.pop();
  p1.socket.emit("round_question", { ...question, qc: 1 });
  p2.socket.emit("round_question", { ...question, qc: 1 });

  startTimer(room, p1, p2);
  return { room: room, question: question };
};

const getRoundResult = async (room: RoomDTO): Promise<GameInstructionDTO> => {
  clearTimeout(rooms[room.name].timer);

  var formattedP1Time;
  var formattedP2Time;
  var isP1First = true;
  var isP2First = true;

  if (room.p1Time && room.p2Time) {
    isP1First = room.p1Time >= room.p2Time;
    isP2First = room.p1Time < room.p2Time;
  }

  const p1Won =
    (room.p1answer === "A" && room.p2answer !== "A") ||
    (room.p1answer === "A" && room.p2answer === "A" && isP1First);
  const p2won =
    (room.p1answer !== "A" && room.p2answer === "A") ||
    (room.p1answer === "A" && room.p2answer === "A" && isP2First);

  if (room.p1Time) {
    const p1TimeDiff = differenceInMilliseconds(room.p1Time!, room.initTime);
    formattedP1Time = (p1TimeDiff / 1000).toFixed(2);
  }
  if (room.p2Time) {
    const p2TimeDiff = differenceInMilliseconds(room.p2Time, room.initTime);
    formattedP2Time = (p2TimeDiff / 1000).toFixed(2);
  }
  rooms[room.name].count++;
  if (p1Won) rooms[room.name].p1Count++;
  if (p2won) rooms[room.name].p2Count++;

  const p1: PlayerResultDTO = {
    pt: formattedP1Time || "10.00",
    ot: formattedP2Time || "10.00",
    pa: p1Won,
    oa: p2won,
  };
  const p2: PlayerResultDTO = {
    pt: formattedP2Time || "10.00",
    ot: formattedP1Time || "10.00",
    pa: p2won,
    oa: p1Won,
  };

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

    const result = await getRoundResult(rooms[room.name]);
    p1.socket.emit("round_result", result.p1);
    p2.socket.emit("round_result", result.p2);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const question = rooms[room.name].questions.pop();
    p1.socket.emit("round_question", {
      ...question,
      qc: rooms[room.name].count,
    });
    p2.socket.emit("round_question", {
      ...question,
      qc: rooms[room.name].count,
    });
    startTimer(rooms[room.name], p1, p2);
  }, 10000);

  rooms[room.name].timer = timer;
  rooms[room.name].initTime = new Date();
};

const endGame = (roomName: string, p1: PlayerDTO, p2: PlayerDTO) => {
  const p1Count = rooms[roomName].p1Count;
  const p2Count = rooms[roomName].p2Count;
  if (p1Count === p2Count) {
    p1.socket.emit("game_end", {
      message: "DRAW",
      ps: p1Count,
      os: p2Count,
    });
    p2.socket.emit("game_end", {
      message: "DRAW",
      ps: p1Count,
      os: p2Count,
    });
  } else {
    p1.socket.emit("game_end", {
      message: p1Count > p2Count ? "VICTORY" : "DEFEAT",
      ps: p1Count,
      os: p2Count,
    });
    p2.socket.emit("game_end", {
      message: p2Count > p1Count ? "VICTORY" : "DEFEAT",
      ps: p2Count,
      os: p1Count,
    });
  }

  p1.socket.disconnect(true);
  p2.socket.disconnect(true);
  clearTimeout(rooms[roomName].timer);
  delete rooms[roomName];
};
