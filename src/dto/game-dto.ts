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
  answer: string;
  p1Count: number;
  p2Count: number;
  p1Time: Date | null;
  p2Time: Date | null;
  p1answer: string | null;
  p2answer: string | null;
  timer: NodeJS.Timeout | null;
};

export type PlayerInstructionDTO = {
  pa: boolean;
  pt: string | null;
  oa: boolean;
  ot: string | null;
  q: string;
};

export type GameInstructionDTO = {
  p1: PlayerInstructionDTO;
  p2: PlayerInstructionDTO;
};
export type TimesUpInstructionDTO = {
  i1: PlayerInstructionDTO;
  i2: PlayerInstructionDTO;
  answer: string;
};
