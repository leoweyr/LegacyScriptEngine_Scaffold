import { Socket } from "node:net";


export interface SocketEvents {
       message: (socket: Socket, message: string) => void;
       close: () => void;
}
