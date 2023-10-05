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
  answer: string;
  p1Time: Date | null;
  p2Time: Date | null;
  p1answer: string | null;
  p2answer: string | null;
};

export type PlayerInstructionDTO = {
  pa: boolean;
  pt: string;
  oa: boolean;
  ot: string;
  question: string;
};

export type GameInstructionDTO = {
  p1: PlayerInstructionDTO;
  p2: PlayerInstructionDTO;
};
