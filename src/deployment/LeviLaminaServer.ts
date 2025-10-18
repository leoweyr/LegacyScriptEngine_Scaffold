import * as File from "fs";
import * as Path from "path";

import { NodeSSH, SSHExecCommandResponse } from "node-ssh";

import { LeviLaminaPluginNotFoundError } from "./LeviLaminaPluginNotFoundError";
import { RemoteSSHConnectionError } from "./RemoteSSHConnectionError";
import { PluginPackage } from "../packager/PluginPackage";
import { RemoteSSHFileUploadError } from "./RemoteSSHFileUploadError";
import { RemotePluginInstallationError } from "./RemotePluginInstallationError";


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

    public async removePlugin(pluginName: string): Promise<void> {
        const pluginPath: string = Path.join(this.pluginDirectory, pluginName.replace("/", "-").replace("@",""));

        if (this.remoteHost === "localhost") {
            if (File.existsSync(pluginPath)) {
                LeviLaminaServer.deleteDirectory(pluginPath);
            } else {
                throw new LeviLaminaPluginNotFoundError(pluginName);
            }
        } else {
            const remoteSSH: NodeSSH = new NodeSSH();

            try {
                await remoteSSH.connect({
                    host: this.remoteHost,
                    port: this.remotePort,
                    username: this.remoteUsername,
                    password: this.remotePassword
                });
            } catch (error) {
                throw new RemoteSSHConnectionError(this);
            }

            const result: SSHExecCommandResponse = await remoteSSH.execCommand(`if exist "${pluginPath}" (echo true) else (echo false)`);

            if (result.stdout.trim() === "true") {
                await remoteSSH.execCommand(`rmdir /s /q "${pluginPath}"`);
            } else {
                throw new LeviLaminaPluginNotFoundError(pluginName);
            }

            // Ignore errors from remoteSSH.dispose().
            remoteSSH.connection.on("error", (error: { code: string; }): void => {
                if (error.code !== 'ECONNRESET') {
                    throw new RemoteSSHConnectionError(this);
                }
            });

            remoteSSH.dispose();
        }
    }

    public async importPlugin(pluginPackage: PluginPackage): Promise<string> {
        if (this.remoteHost !== "localhost") {
            const remoteSSH: NodeSSH = new NodeSSH();

            try {
                await remoteSSH.connect({
                    host: this.remoteHost,
                    port: this.remotePort,
                    username: this.remoteUsername,
                    password: this.remotePassword
                });

            } catch (error) {
                throw new RemoteSSHConnectionError(this);
            }

            const remotePluginPackagePath: string = Path.join(this.pluginDirectory, pluginPackage.getName(), ".zip");

            try {
                await remoteSSH.putFile(pluginPackage.getPath(), remotePluginPackagePath);
            } catch (error) {
                throw new RemoteSSHFileUploadError(pluginPackage.getPath(), this);
            }

            try {
                await remoteSSH.execCommand(
                    `powershell -command "Expand-Archive -Path ${remotePluginPackagePath} -DestinationPath ${Path.join(this.pluginDirectory, pluginPackage.getName())}" && del ${remotePluginPackagePath}`
                );
            } catch (error) {
                throw new RemotePluginInstallationError(this);
            }

            /* TODO: Enhancement Required - Need a more elegant solution to handle the following issue,
            *  instead of adding event listeners that cause the task to wait for termination even after completion:
            *
            *  Error: read ECONNRESET
            *      at TCP.onStreamRead (node:internal/stream_base_commons:216:20)
            *   Emitted 'error' event on Client instance at:
            *      at Socket.<anonymous> (node_modules/ssh2/lib/client.js:805:12)
            *      at Socket.emit (node:events:518:28)
            *      at emitErrorNT (node:internal/streams/destroy:170:8)
            *      at emitErrorCloseNT (node:internal/streams/destroy:129:3)
            *      at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
            *        errno: -4077,
            *        code: 'ECONNRESET',
            *        syscall: 'read',
            *        level: 'client-socket'
            *      }
            */

            // Ignore errors from remoteSSH.dispose().
            remoteSSH.connection.on("error", (error: { code: string; }): void => {
                if (error.code !== 'ECONNRESET') {
                    throw new RemoteSSHConnectionError(this);
                }
            });

            remoteSSH.dispose();
        } else {
            await pluginPackage.expand(this.pluginDirectory);
        }

        return `The Plugin has been imported to LeviLamina ${this.getRootPath()}${this.remoteHost === "localhost" ? "" : " in " + this.getRemoteAddress(false)}.`;
    }

    public getRootPath(): string {
        return this.rootPath;
    }

    public getRemoteAddress(isIncludePort: boolean): string {
        return `${this.remoteUsername}@${this.remoteHost}${isIncludePort ? ":" + this.remotePort : ""}`;
    }
}
