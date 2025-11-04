import { Socket, createConnection } from "node:net";

import { BaseSocketEventable } from "./BaseSocketEventable";
import { SocketServer } from "./SocketServer";


export class SocketClient extends BaseSocketEventable {
    private readonly socketPath: string;
    private socket: Socket | null;

    constructor(aliasName: string) {
        super();

        this.socketPath = SocketServer.getSocketPath(aliasName);
        this.socket = null;
    }

    public async connect(): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {
            this.socket = createConnection(this.socketPath, (): void => {
                this.socket?.on("data", (chunk: Buffer): void => {
                    this.emit("message", this.socket!, chunk.toString().trim());
                });

                resolve();
            });

            this.socket.on("error", (error: Error): void => {
                reject(error);
            });

            this.socket.on("close", (): void => {
                this.emit("close");
            });
        });
    }

    public sendMessage(message: string): void {
        if (this.socket) {
            this.socket.write(message);
        }
    }
}
