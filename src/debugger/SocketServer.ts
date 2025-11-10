import * as Os from "node:os";
import * as Path from "node:path";
import { Server, Socket, createServer } from "node:net";
import * as File from "node:fs";

import { BaseSocketEventable } from "./BaseSocketEventable";


export class SocketServer extends BaseSocketEventable {
    public static getSocketPath(aliasName: string): string {
        if (Os.platform() === "win32") {
            return `\\\\.\\pipe\\legacy_script_engine_scaffold_debugger_${aliasName}`;
        } else {
            return Path.join(
                Os.tmpdir(), 
                `legacy_script_engine_scaffold_debugger_${aliasName}.sock`
            );
        }
    }

    private readonly socketPath: string;
    private readonly server: Server;
    private readonly sockets: Set<Socket> = new Set<Socket>();

    constructor(aliasName: string) {
        super();

        this.socketPath = SocketServer.getSocketPath(aliasName);
        this.server = createServer();
    }

    public async start(): Promise<void> {
        return new Promise((resolve: () => void, 
            reject: (error: Error) => void): void => {

            // Clean up old debugger files under the Linux platform.
            if (Os.platform() !== "win32" && File.existsSync(this.socketPath)) {
                File.unlinkSync(this.socketPath);
            }

            this.server.listen(this.socketPath, (): void => {
                resolve();
            });

            this.server.on("error", (error: Error): void => {
                reject(error);
            });

            this.server.on("connection", (socket: Socket): void => {
                this.sockets.add(socket);

                socket.on("data", (chunk: Buffer): void => {
                    if (chunk.toString().trim()) {
                        this.emit("message", socket, chunk.toString().trim());
                    }
                });

                socket.on("close", (): void => {
                    this.sockets.delete(socket);
                });
            });
        });
    }

    public sendMessage(message: string): void {
        this.sockets.forEach((socket: Socket): void => {
            if (socket.writable && !socket.destroyed) {
                try {
                    socket.write(message);
                } catch (error) {
                    this.sockets.delete(socket);
                }
            } else {
                this.sockets.delete(socket);
            }
        });
    }
}
