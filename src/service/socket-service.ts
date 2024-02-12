import userService from "./user-service";
import questionServiceEn from "./question-service-en";

import { log } from "console";
import { Server } from "socket.io";
import { EventType, ResultScenario } from "../utils/enums";
import { PlayerDTO, PlayerResultDTO, RoomDTO } from "../dto/game-dto";
import { differenceInMilliseconds } from "date-fns";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../utils/interfaces";

var queue: PlayerDTO[] = [];
var rooms: { [key: string]: RoomDTO } = {};

export function initializeSocket(server: any) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { cors: { origin: "*" } });

  io.on("connection", async (socket) => {
    var { id } = socket.handshake.query;
    if (!id) return socket.disconnect();

    const playerId = id as unknown as number;
    if (queue.some((player) => player.id === playerId)) return;
    log("CONNECTED: ", id);

    const user = await userService.getById(playerId);
    const player: PlayerDTO = {
      id: user.id,
      name: user.firstName || user.lastName,
      photo: user.photo,
      socket: socket,
    };

    //
    queue.push(player);

    socket.on("disconnect", async (reason) => {
      //IN QUEUE
      if (queue.some((player) => player.id === playerId)) {
        log("IN QUEUE DISCONNECTED: ", socket.data);
        queue = queue.filter((player) => player.id !== playerId);
        return;
      }
      //IN GAME
      const opponentSocket = io.sockets.sockets.get(
        socket.data.opponentSocketId
      );

      if (
        opponentSocket &&
        opponentSocket.connected &&
        rooms[socket.data.roomName] != null
      ) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        log("LEFT GAME: ", socket.data);
        const room = rooms[socket.data.roomName];
        opponentSocket.emit(EventType.GAME_END, {
          message: "OPPONENT LEFT",
          ps: room.count < 4 ? 0 : room.redCount,
          os: 0,
        });
        //TODO - Find out why this causes problems to mobile app?
        clearTimeout(rooms[socket.data.roomName].timer!);
        opponentSocket.disconnect();
        log("DISCONNECTED OPPONENT: ", opponentSocket.data);
        delete rooms[socket.data.roomName];
      }
    });

    if (queue.length < 2) return;

    const redPlayer = queue.shift();
    const bluePlayer = queue.shift();
    if (!redPlayer || !bluePlayer) return;

    const init = await startGame(redPlayer, bluePlayer);

    // HANDLE THE MESSAGE SENT BY P1
    redPlayer.socket.on(init.name, async (data: string) => {
      if (rooms[init.name].redTime) return; //ALREADY ANSWERED

      rooms[init.name].redTime = new Date();
      rooms[init.name].redAnswer = data;

      if (!rooms[init.name].blueTime) return; //WAIT FOR OPPONENT ANSWER

      await endRound(rooms[init.name], redPlayer, bluePlayer);

      if (rooms[init.name].count > 10) {
        return endGame(init.name, redPlayer, bluePlayer);
      }

      await startRound(init.name, redPlayer, bluePlayer);
    });

    // HANDLE THE MESSAGE SENT BY P2
    bluePlayer.socket.on(init.name, async (data: string) => {
      if (rooms[init.name].blueTime) return; //ALREADY ANSWERED

      rooms[init.name].blueTime = new Date();
      rooms[init.name].blueAnswer = data;

      if (!rooms[init.name].redTime) return; //WAIT FOR OPPONENT ANSWER

      await endRound(rooms[init.name], redPlayer, bluePlayer);

      if (rooms[init.name].count > 10) {
        return endGame(init.name, redPlayer, bluePlayer);
      }

      await startRound(init.name, redPlayer, bluePlayer);
    });
  });
}

//GAME
const startGame = async (
  redPlayer: PlayerDTO,
  bluePlayer: PlayerDTO
): Promise<RoomDTO> => {
  console.log("START GAME");

  const sortedUserIds = [redPlayer.id, bluePlayer.id].sort();
  const roomName = sortedUserIds.join("_");

  const questions = await questionServiceEn.getGameQuestions(
    redPlayer.id,
    bluePlayer.id
  );
  const room: RoomDTO = {
    name: [redPlayer.id, bluePlayer.id].sort().join("_"),
    initTime: new Date(),
    count: 1,
    redCount: 0,
    blueCount: 0,
    redTime: null,
    blueTime: null,
    redAnswer: null,
    blueAnswer: null,
    timer: null,
    questions: questions,
  };
  rooms[roomName] = room;

  redPlayer.socket.data.roomName = room.name;
  redPlayer.socket.data.opponentSocketId = bluePlayer.socket.id;
  redPlayer.socket.data.userId = redPlayer.id;
  redPlayer.socket.data.opponentId = bluePlayer.id;
  redPlayer.socket.emit(EventType.GAME_START, {
    t: "RED",
    rn: room.name,
    on: bluePlayer.name,
    op: bluePlayer.photo,
    pn: redPlayer.name,
    pp: redPlayer.photo,
  });
  bluePlayer.socket.data.roomName = room.name;
  bluePlayer.socket.data.opponentSocketId = redPlayer.socket.id;
  bluePlayer.socket.data.userId = bluePlayer.id;
  bluePlayer.socket.data.opponentId = redPlayer.id;
  bluePlayer.socket.emit(EventType.GAME_START, {
    t: "BLUE",
    rn: room.name,
    on: redPlayer.name,
    op: redPlayer.photo,
    pn: bluePlayer.name,
    pp: bluePlayer.photo,
  });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("START ROUND");
  const question = rooms[room.name].questions.pop();
  redPlayer.socket.emit(EventType.ROUND_START, { ...question, qc: 1 });
  bluePlayer.socket.emit(EventType.ROUND_START, { ...question, qc: 1 });

  startTimer(room, redPlayer, bluePlayer);
  return room;
};

const endGame = (
  roomName: string,
  redPlayer: PlayerDTO,
  bluePlayer: PlayerDTO
) => {
  console.log("END GAME");
  const redCount = rooms[roomName].redCount;
  const blueCount = rooms[roomName].blueCount;
  if (redCount === blueCount) {
    redPlayer.socket.emit(EventType.GAME_END, {
      message: "DRAW",
      ps: redCount,
      os: blueCount,
    });
    bluePlayer.socket.emit(EventType.GAME_END, {
      message: "DRAW",
      ps: redCount,
      os: blueCount,
    });
  } else {
    redPlayer.socket.emit(EventType.GAME_END, {
      message: redCount > blueCount ? "VICTORY" : "DEFEAT",
      ps: redCount,
      os: blueCount,
    });
    bluePlayer.socket.emit(EventType.GAME_END, {
      message: blueCount > redCount ? "VICTORY" : "DEFEAT",
      ps: blueCount,
      os: redCount,
    });
  }

  clearTimeout(rooms[roomName].timer!);
  delete rooms[roomName];
};

//ROUND
const getResultScenario = (room: RoomDTO): ResultScenario => {
  //NEITHER ANSWERED
  if (!room.redTime && !room.blueTime) return ResultScenario.BOTH_NOT_ANSWERED;

  //BOTH ANSWERED
  if (room.redTime && room.blueTime) {
    const p1AnsweredA = room.redAnswer === "A";
    const p2AnsweredA = room.blueAnswer === "A";
    if (!p1AnsweredA && !p2AnsweredA) return ResultScenario.BOTH_INCORRECT;

    if (p1AnsweredA && p2AnsweredA) {
      return room.redTime <= room.blueTime
        ? ResultScenario.RED_QUICKER_CORRECT
        : ResultScenario.BLUE_QUICKER_CORRECT;
    }

    if (p1AnsweredA && !p2AnsweredA) {
      return ResultScenario.RED_CORRECT_BLUE_INCORRECT;
    }
    if (p2AnsweredA && !p1AnsweredA) {
      return ResultScenario.BLUE_CORRECT_RED_INCORRECT;
    }

    return ResultScenario.BLUE_CORRECT_RED_INCORRECT;
  }
  //ONLY P1 ANSWERED
  if (room.redTime) {
    return room.redAnswer === "A"
      ? ResultScenario.RED_CORRECT_BLUE_NOT_ANSWERED
      : ResultScenario.RED_INCORRECT_BLUE_NOT_ANSWERED;
  }
  if (room.blueTime) {
    return room.blueAnswer === "A"
      ? ResultScenario.BLUE_CORRECT_RED_NOT_ANSWERED
      : ResultScenario.BLUE_INCORRECT_RED_NOT_ANSWERED;
  }

  return ResultScenario.BOTH_NOT_ANSWERED;
};

const startRound = async (
  roomName: string,
  redPlayer: PlayerDTO,
  bluePlayer: PlayerDTO
) => {
  console.log("START ROUND");
  const question = rooms[roomName].questions.pop();
  redPlayer.socket.emit(EventType.ROUND_START, {
    ...question,
    qc: rooms[roomName].count,
  });
  bluePlayer.socket.emit(EventType.ROUND_START, {
    ...question,
    qc: rooms[roomName].count,
  });
  startTimer(rooms[roomName], redPlayer, bluePlayer);
};

const endRound = async (
  room: RoomDTO,
  player1: PlayerDTO,
  player2: PlayerDTO
): Promise<void> => {
  console.log("END ROUND");
  const {
    timer,
    count,
    redCount,
    blueCount,
    initTime,
    redTime,
    blueTime,
    redAnswer,
    blueAnswer,
  } = rooms[room.name];

  clearTimeout(timer!);

  //SCORE UPDATE
  const scenario = getResultScenario(room);
  switch (scenario) {
    case ResultScenario.BOTH_INCORRECT:
      log(`Q:${count} - BOTH_INCORRECT`);
      if (redCount > 0) rooms[room.name].redCount -= 1;
      if (blueCount > 0) rooms[room.name].blueCount -= 1;
      break;
    case ResultScenario.RED_QUICKER_CORRECT:
      log(`Q:${count} - P1_QUICKER_CORRECT`);
      rooms[room.name].redCount += 2;
      break;
    case ResultScenario.BLUE_QUICKER_CORRECT:
      log(`Q:${count} - P2_QUICKER_CORRECT`);
      rooms[room.name].blueCount += 2;
      break;
    case ResultScenario.RED_CORRECT_BLUE_INCORRECT:
      log(`Q:${count} - P1_CORRECT_P2_INCORRECT`);
      rooms[room.name].redCount += 2;
      if (blueCount > 0) rooms[room.name].blueCount -= 1;
      break;
    case ResultScenario.BLUE_CORRECT_RED_INCORRECT:
      log(`Q:${count} - P2_CORRECT_P1_INCORRECT`);
      rooms[room.name].blueCount += 2;
      if (redCount > 0) rooms[room.name].redCount -= 1;
      break;
    case ResultScenario.RED_CORRECT_BLUE_NOT_ANSWERED:
      log(`Q:${count} - P1_CORRECT_P2_NOT_ANSWERED`);
      rooms[room.name].redCount += 2;
      break;
    case ResultScenario.BLUE_CORRECT_RED_NOT_ANSWERED:
      log(`Q:${count} - P2_CORRECT_P1_NOT_ANSWERED`);
      rooms[room.name].blueCount += 2;
      break;
    case ResultScenario.RED_INCORRECT_BLUE_NOT_ANSWERED:
      log(`Q:${count} - P1_INCORRECT_P2_NOT_ANSWERED`);
      if (redCount > 0) rooms[room.name].redCount -= 1;
      break;
    case ResultScenario.BLUE_INCORRECT_RED_NOT_ANSWERED:
      log(`Q:${count} - P2_INCORRECT_P1_NOT_ANSWERED`);
      if (blueCount > 0) rooms[room.name].blueCount -= 1;
      break;
    case ResultScenario.BOTH_NOT_ANSWERED:
      log(`Round:${count} - BOTH_NOT_ANSWERED`);
      //
      break;
  }

  rooms[room.name].count++;
  log("P1: ", rooms[room.name].redCount);
  log("P2: ", rooms[room.name].blueCount);
  log("*********");

  //
  var formattedP1Time;
  var formattedP2Time;

  if (redTime) {
    const p1TimeDiff = differenceInMilliseconds(redTime, initTime);
    formattedP1Time = (p1TimeDiff / 1000).toFixed(2);
  }
  if (blueTime) {
    const p2TimeDiff = differenceInMilliseconds(blueTime, initTime);
    formattedP2Time = (p2TimeDiff / 1000).toFixed(2);
  }

  const redPlayer: PlayerResultDTO = {
    scenario: ResultScenario[scenario],
    pt: formattedP1Time || "10.00",
    ot: formattedP2Time || "10.00",
    pa: redAnswer!,
    oa: blueAnswer!,
    pc: rooms[room.name].redCount,
    oc: rooms[room.name].blueCount,
  };
  const bluePlayer: PlayerResultDTO = {
    scenario: ResultScenario[scenario],
    pt: formattedP2Time || "10.00",
    ot: formattedP1Time || "10.00",
    pa: blueAnswer!,
    oa: redAnswer!,
    pc: rooms[room.name].blueCount,
    oc: rooms[room.name].redCount,
  };

  //reset room values
  rooms[room.name].initTime = new Date();
  rooms[room.name].redTime = null;
  rooms[room.name].blueTime = null;
  rooms[room.name].redAnswer = null;
  rooms[room.name].blueAnswer = null;

  //
  player1.socket.emit(EventType.ROUND_END, redPlayer);
  player2.socket.emit(EventType.ROUND_END, bluePlayer);
  await new Promise((resolve) => setTimeout(resolve, 5000));
};

//TIMER

const startTimer = (
  room: RoomDTO,
  redPlayer: PlayerDTO,
  bluePlayer: PlayerDTO
) => {
  //
  if (rooms[room.name].timer) clearTimeout(rooms[room.name].timer!); //CLEAR PREVIOUS TIMER

  try {
    const timer = setTimeout(async () => {
      console.log("EXECUTE TIMER");
      await endRound(rooms[room.name], redPlayer, bluePlayer);

      //
      if (rooms[room.name].count >= 10)
        return endGame(room.name, redPlayer, bluePlayer);
      //
      await startRound(room.name, redPlayer, bluePlayer);
    }, 10000);

    rooms[room.name].timer = timer;
    rooms[room.name].initTime = new Date();
  } catch (error) {
    console.log("TIMER ERROR: ", error);
  }
};

export { getResultScenario };
