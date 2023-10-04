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
  initTime: Date;
  p1Time: Date | null;
  p2Time: Date | null;
};
