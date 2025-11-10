#!/usr/bin/env node


import { program } from "commander";
import { Socket } from "node:net";

import { CliLogger } from "./CliLogger";
import { TypeScriptProject } from "../project/TypeScriptProject";
import { CliLoggableError } from "./exceptions/CliLoggableError";
import { Packager } from "../packager/Packager";
import { LeviLaminaServer } from "../deployment/LeviLaminaServer";
import { PluginPackage } from "../packager/PluginPackage";
import { SocketClient } from "../debugger/SocketClient";
import { DebuggerNotFoundError } from "../debugger/exceptions/DebuggerNotFoundError";


async function deploy(
    logger: CliLogger,
    path: string,
    remoteHost?: string,
    remotePort?: number,
    remoteUsername?: string,
    remotePassword?: string
): Promise<void> {
    try {
        const project: TypeScriptProject = TypeScriptProject.getInstance();
        const packager: Packager = new Packager(project);
        const leviLaminaServer: LeviLaminaServer = new LeviLaminaServer(
            path,
            remoteHost,
            remotePort,
            remoteUsername,
            remotePassword
        );
        const pluginPackage: PluginPackage = packager.getPluginPackage();

        try {
            await leviLaminaServer.removePlugin(project.getName());
        } catch (error) {
            // Do nothing if the plugin does not exist.
        }

        const successMessage: string = await leviLaminaServer.importPlugin(pluginPackage);

        logger.success(successMessage);
    } catch (error) {
        logger.error(error as CliLoggableError);
    }
}


program
    .name("lses")
    .version("0.1.0")
    .description("A utility for assisting in the development of Legacy Script Engine plugins.");

program
    .command("manifest")
    .description("generate manifest.json for the Legacy Script Engine plugin")
    .action((): void => {
        const logger: CliLogger = new CliLogger("manifest");

        try {
            const project: TypeScriptProject = TypeScriptProject.getInstance();

            const successMessage: string = project.getManifest().generate();
            logger.success(successMessage);
        } catch (error) {
            logger.error(error as CliLoggableError);
        }
    });

program
    .command("pack")
    .description("package the Legacy Script Engine plugin")
    .action(async (): Promise<void> => {
        const logger = new CliLogger("pack");

        try {
            const project: TypeScriptProject = TypeScriptProject.getInstance();
            const packager: Packager = new Packager(project);

            const successMessage: string = await packager.package();
            logger.success(successMessage);
        } catch (error) {
            logger.error(error as CliLoggableError);
        }
    });

program
    .command("deploy-path")
    .description("deploy the Legacy Script Engine plugin package to the LeviLamina server by path")
    .argument("<path>", "specific LeviLamina server working directory")
    .option("-h, --host <remote-host>", "remote Windows OpenSSH host")
    .option("-P, --port <remote-port>", "remote Windows OpenSSH port", "22")
    .option("-u, --username <remote-username>", "remote Windows OpenSSH username")
    .option("-p, --password <remote-password>", "remote Windows OpenSSH password")
    .action(async (
        path: string,
        options: {
            host?: string;
            port?: number;
            username?: string;
            password?: string;
        }
    ): Promise<void> => {
        const logger = new CliLogger("deploy-path");

        await deploy(logger, path, options.host, options.port, options.username, options.password);
    });

program
    .command("deploy-debug")
    .description("deploy the Legacy Script Engine plugin package to the LeviLamina server debugger instance")
    .argument("<debugger-name>", "specific LeviLamina server debugger instance name")
    .action(async (debuggerName: string): Promise<void> => {
        const logger = new CliLogger("deploy-debug");

        try {
            const socketClient: SocketClient = new SocketClient(debuggerName);

            try {
                await socketClient.connect();
            } catch (error) {
                throw new DebuggerNotFoundError(debuggerName);
            }

            let remoteConfiguration: {
                path: string;
                host: string;
                port: number;
                username: string;
                password: string;
            };

            await new Promise<void>(async (resolve: () => void, reject: (error: Error) => void): Promise<void> => {
                socketClient.on("message", (socket: Socket, message: string): void => {
                    remoteConfiguration = JSON.parse(message);

                    resolve();
                });

                socketClient.sendMessage("0");
            });

            await deploy(
                logger,
                remoteConfiguration!.path,
                remoteConfiguration!.host,
                remoteConfiguration!.port,
                remoteConfiguration!.username,
                remoteConfiguration!.password
            );

            socketClient.on("close", (): void => {
                logger.success(`The plugin has been hot reloaded in LeviLamina server debugger ${debuggerName}.`);
            });

            socketClient.sendMessage(
                `1_${(new Packager(TypeScriptProject.getInstance())).getPluginPackage().getName()}`
            );
        } catch (error) {
            logger.error(error as CliLoggableError);
        }
    });

program
    .command("debug")
    .description("launch a LeviLamina server as a debugger")
    .argument("<path>", "specific LeviLamina server working directory")
    .argument("<name>", "alias name for the debugger instance")
    .option("-h, --host <remote-host>", "remote Windows OpenSSH host")
    .option("-P, --port <remote-port>", "remote Windows OpenSSH port", "22")
    .option("-u, --username <remote-username>", "remote Windows OpenSSH username")
    .option("-p, --password <remote-password>", "remote Windows OpenSSH password")
    .action(async (
        path: string,
        name: string,
        options: {
            host?: string;
            port?: number;
            username?: string;
            password?: string;
        }
    ): Promise<void> => {
        const logger = new CliLogger("debug");

        const leviLaminaServer: LeviLaminaServer = new LeviLaminaServer(
            path,
            options.host,
            options.port,
            options.username,
            options.password
        );

        try {
            await leviLaminaServer.start(name, logger);
        } catch (error) {
            logger.error(error as CliLoggableError);
        }
    });

program.on("command:*", (): void => {
    console.error(`Error: Invalid command lses ${program.args.join(" ")}`);
    program.help();
});

program.parse(process.argv);
