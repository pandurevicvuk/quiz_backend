export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  start_game: (message: string) => void;
  game_end: (data: { message: string; ps: number; os: number }) => {};
}

export interface ClientToServerEvents {
  hello: () => void;
  join: (data: { id: number; name: string; photo: string }) => void;
  leave: (data: { id: number; name: string; photo: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: number;
  roomName: string;
  opponentId: number;
  opponentSocketId: string;
}
