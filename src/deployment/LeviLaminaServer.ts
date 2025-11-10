import * as File from "fs";
import * as Path from "path";
import { EventEmitter } from "node:events";
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { Socket } from "node:net";

import { Client, ClientChannel, ClientErrorExtensions, SFTPWrapper } from "ssh2";

import { CliLogger } from "../cli/CliLogger";
import { SocketServer } from "../debugger/SocketServer";
import { LeviLaminaPluginNotFoundError } from "./exceptions/LeviLaminaPluginNotFoundError";
import { RemoteSSHConnectionError } from "./exceptions/RemoteSSHConnectionError";
import { PluginPackage } from "../packager/PluginPackage";
import { RemoteSSHFileUploadError } from "./exceptions/RemoteSSHFileUploadError";
import { RemotePluginInstallationError } from "./exceptions/RemotePluginInstallationError";


export class LeviLaminaServer {
    private static deleteDirectory(basePath: string): void {
        if (File.existsSync(basePath)) {
            File.readdirSync(basePath).forEach((file: string): void => {
                const currentPath: string = Path.join(basePath, file);

                if (File.lstatSync(currentPath).isDirectory()) {
                    LeviLaminaServer.deleteDirectory(currentPath);
                } else {
                    File.unlinkSync(currentPath);
                }
            });

            File.rmdirSync(basePath);
        }
    }

    private readonly remoteHost: string;
    private readonly remotePort: number;
    private readonly remoteUsername: string;
    private readonly remotePassword: string;

    private readonly rootPath: string;
    private readonly pluginDirectory: string;

    public constructor(
        rootPath: string,
        remoteHost: string = "localhost",
        remotePort: number = 22,
        remoteUsername: string = "administrator",
        remotePassword: string = "password"
    ) {
        this.remoteHost = remoteHost;
        this.remotePort = remotePort;
        this.remoteUsername = remoteUsername;
        this.remotePassword = remotePassword;

        this.rootPath = rootPath;
        this.pluginDirectory = Path.join(rootPath, "plugins");
    }

    public async start(aliasName: string, logger: CliLogger): Promise<void> {
        const serverExecutedPath: string = Path.join(this.getRootPath(), "bedrock_server_mod.exe");
        const serverOutputReceiver: EventEmitter = new EventEmitter();
        let serverCommandSender: (command: string) => void;

        if (this.remoteHost !== "localhost") {
            const remoteSSH: Client = new Client();
            let remoteSSHChannel: ClientChannel;

            remoteSSH
                .on("ready", (): void => {
                    remoteSSH.exec(serverExecutedPath, (error: Error | undefined, channel: ClientChannel): void => {
                        if (error) throw error;

                        remoteSSHChannel = channel;

                        channel
                            .on("data", (chunk: Buffer): void => {
                                logger.info(chunk.toString());
                                serverOutputReceiver.emit("output", chunk.toString());
                            })
                            .on("close", (code: number, signal: string): void => {
                                remoteSSH.end();
                                process.exit(0);
                            });

                        process.stdin.pipe(channel);
                    });
                })
                .connect({
                   host: this.remoteHost,
                   port: this.remotePort,
                   username: this.remoteUsername,
                   password: this.remotePassword
                });

                serverCommandSender = (command: string): void => {
                    if (remoteSSHChannel && !remoteSSHChannel.destroyed) {
                        remoteSSHChannel.write(command);
                    }
                };
        } else {
            const serverInstance: ChildProcessWithoutNullStreams = spawn(serverExecutedPath);

            serverInstance.on("close", (code: number, signal: string): void => {
                process.exit(0);
            });

            serverInstance.stdout.on("data", (chunk: Buffer): void => {
                logger.info(chunk.toString());
                serverOutputReceiver.emit("output", chunk.toString());
            });

            process.stdin.on("data", (chunk: Buffer): void => {
                serverInstance.stdin.write(chunk);
            });

            serverCommandSender = (command: string): void => {
                serverInstance.stdin.write(command);
            };
        }

        const socketServer: SocketServer = new SocketServer(aliasName);
        await socketServer.start();

        socketServer.on("message", (socket: Socket, message: string): void => {
            if (message === "0") {
                const remoteConfiguration: {
                    path: string;
                    host: string;
                    port: number;
                    username: string;
                    password: string;
                } = {
                    path: this.getRootPath(),
                    host: this.remoteHost,
                    port: this.remotePort,
                    username: this.remoteUsername,
                    password: this.remotePassword
                }

                socketServer.sendMessage(JSON.stringify(remoteConfiguration, null, 4));
            } else if (message.startsWith("1")) {
                const pluginName: string = message.split("_")[1];

                serverOutputReceiver.on("output", (output: string): void => {
                    if (output.includes(`Reload mod ${pluginName} successfully`)) {
                        socket.destroy();
                    }
                });

                serverCommandSender(`ll reload ${pluginName}\n`);
            }
        });
    }

    public async removePlugin(pluginName: string): Promise<void> {
        const pluginPath: string = Path.join(
            this.pluginDirectory,
            pluginName.replace("/", "-").replace("@","")
        );

        if (this.remoteHost === "localhost") {
            if (File.existsSync(pluginPath)) {
                LeviLaminaServer.deleteDirectory(pluginPath);
            } else {
                throw new LeviLaminaPluginNotFoundError(pluginName);
            }
        } else {
            const remoteSSH: Client = new Client();

            try {
                await new Promise<void>((resolve, reject): void => {
                    remoteSSH
                        .on('ready', (): void => resolve())
                        .on(
                            'error',
                            (error: Error & ClientErrorExtensions): void => reject(new RemoteSSHConnectionError(this))
                        )
                        .connect({
                            host: this.remoteHost,
                            port: this.remotePort,
                            username: this.remoteUsername,
                            password: this.remotePassword
                        });
                });
            } catch (error) {
                throw new RemoteSSHConnectionError(this);
            }

            try {
                const result: { stdout: string } = await new Promise<{ stdout: string }>((resolve, reject): void => {
                    remoteSSH.exec(
                        `if exist "${pluginPath}" (echo true) else (echo false)`,
                        (error: Error | undefined, stream: ClientChannel): void => {
                            if (error) {
                                reject(error);

                                return;
                            }

                            let stdout: string = '';

                            stream
                                .on('data', (chunk: Buffer): void => {
                                    stdout += chunk.toString();
                                })
                                .on('end', (): void => {
                                    resolve({ stdout });
                                })
                                .on('error', reject);
                        }
                    );
                });

                if (result.stdout.trim() === "true") {
                    await new Promise<void>((resolve, reject): void => {
                        remoteSSH.exec(
                            `rmdir /s /q "${pluginPath}"`,
                            (error: Error | undefined, stream: ClientChannel): void => {
                                if (error) {
                                    reject(error);

                                    return;
                                }

                                stream
                                    .on('end', (): void => resolve())
                                    .on('error', reject);
                            }
                        );
                    });
                } else {
                    remoteSSH.end();

                    throw new LeviLaminaPluginNotFoundError(pluginName);
                }
            } finally {
                remoteSSH.end();
            }
        }
    }

    public async importPlugin(pluginPackage: PluginPackage): Promise<string> {
        if (this.remoteHost !== "localhost") {
            const remoteSSH: Client = new Client();

            try {
                await new Promise<void>((resolve, reject): void => {
                    remoteSSH
                        .on('ready', (): void => resolve())
                        .on(
                            'error',
                            (error: Error & ClientErrorExtensions): void => reject(new RemoteSSHConnectionError(this))
                        )
                        .connect({
                            host: this.remoteHost,
                            port: this.remotePort,
                            username: this.remoteUsername,
                            password: this.remotePassword
                        });
                });
            } catch (error) {
                throw new RemoteSSHConnectionError(this);
            }

            const remotePluginPackagePath: string = Path.join(this.pluginDirectory, `${pluginPackage.getName()}.zip`);

            try {
                await new Promise<void>((resolve, reject): void => {
                    remoteSSH.sftp((error: Error | undefined, sftp: SFTPWrapper): void => {
                        if (error) {
                            reject(error);

                            return;
                        }

                        sftp.fastPut(
                            pluginPackage.getPath(),
                            remotePluginPackagePath,
                            (error: Error | null | undefined): void => {
                                if (error) {
                                    reject(new RemoteSSHFileUploadError(pluginPackage.getPath(), this));
                                } else {
                                    sftp.end();

                                    resolve();
                                }
                            }
                        );
                    });
                });

                await new Promise<void>((resolve, reject): void => {
                    remoteSSH.exec(
                        `powershell -command "Expand-Archive -Path ${remotePluginPackagePath} -DestinationPath ${Path.join(this.pluginDirectory, pluginPackage.getName())}" && del ${remotePluginPackagePath}`,
                        (error: Error | undefined, stream: ClientChannel): void => {
                            if (error) {
                                reject(new RemotePluginInstallationError(this));

                                return;
                            }
                            
                            stream
                                .on('end', (): void => resolve())
                                .on('close', (): void => resolve())
                                .on('error', (error: Error): void => reject(new RemotePluginInstallationError(this)));

                            // Workaround for SSH channel not receiving execution completion signals.
                            setTimeout((): void => resolve(), 3000);
                        }
                    );
                })
            } finally {
                remoteSSH.end();
            }
        } else {
            await pluginPackage.expand(this.pluginDirectory);
        }

        return `The plugin has been imported to LeviLamina ${this.getRootPath()}${this.remoteHost === "localhost" ? "" : " in " + this.getRemoteAddress(false)}.`;
    }

    public getRootPath(): string {
        return this.rootPath;
    }

    public getRemoteAddress(isIncludePort: boolean): string {
        return `${this.remoteUsername}@${this.remoteHost}${isIncludePort ? ":" + this.remotePort : ""}`;
    }
}
