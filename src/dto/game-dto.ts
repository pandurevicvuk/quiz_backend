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
  redCount: number;
  blueCount: number;
  redTime: Date | null;
  blueTime: Date | null;
  redAnswer: string | null;
  blueAnswer: string | null;
  timer: NodeJS.Timeout | null;
  questions: QuestionDTO[];
};

export type PlayerResultDTO = {
  pa: string;
  pt: string | null;
  oa: string;
  ot: string | null;
  scenario: string;
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
