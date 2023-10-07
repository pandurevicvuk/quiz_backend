import { InferType } from "yup";
import { playerScheme } from "../validation/game-validation";
import { Socket } from "socket.io";

export type PlayerDTO = {
  id: number;
  name: string;
  photo: string;
  socket: Socket;
};
export type RoomDTO = {
  name: string;
  initTime: Date;
  count: number;
  p1Count: number;
  p2Count: number;
  p1Time: Date | null;
  p2Time: Date | null;
  p1answer: string | null;
  p2answer: string | null;
  timer: NodeJS.Timeout | null;
  questions: QuestionDTO[];
};

export type PlayerResultDTO = {
  pa: string;
  pt: string | null;
  oa: string;
  ot: string | null;
};

export type GameInstructionDTO = {
  p1: PlayerResultDTO;
  p2: PlayerResultDTO;
};
export type TimesUpInstructionDTO = {
  i1: PlayerResultDTO;
  i2: PlayerResultDTO;
  answer: string;
};

export type QuestionDTO = {
  q: string;
  a: string;
  b: string;
  c: string;
};
