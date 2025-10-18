#!/usr/bin/env node


import { program } from "commander";

import { CliLogger } from "./CliLogger";
import { TypeScriptProject } from "../project/TypeScriptProject";
import { CliLoggableError } from "./CliLoggableError";
import { Packager } from "../packager/Packager";
import { LeviLaminaServer } from "../deployment/LeviLaminaServer";
import { PluginPackage } from "../packager/PluginPackage";


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
    .command("deploy")
    .description("deploy the Legacy Script Engine plugin package to the LeviLamina server")
    .argument("<path>", "specific LeviLamina server working directory")
    .option("-h, --host <remoteHost>", "remote Windows OpenSSH host")
    .option("-P, --port <remotePort>", "remote Windows OpenSSH port", "22")
    .option("-u, --username <remoteUsername>", "remote Windows OpenSSH username")
    .option("-p, --password <remotePassword>", "remote Windows OpenSSH password")
    .action(async (
        path: string,
        options: {
            host?: string;
            port?: number;
            username?: string;
            password?: string;
        }
    ): Promise<void> => {
        const logger = new CliLogger("deploy");

        try {
            const project: TypeScriptProject = TypeScriptProject.getInstance();
            const packager: Packager = new Packager(project);
            const leviLaminaServer: LeviLaminaServer = new LeviLaminaServer(
                path,
                options.host,
                options.port,
                options.username,
                options.password
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
    });

program.on("command:*", (): void => {
    console.error(`Error: Invalid command lses ${program.args.join(" ")}`);
    program.help();
});

program.parse(process.argv);
