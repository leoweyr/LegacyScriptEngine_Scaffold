import * as File from "fs";
import * as Path from "path";

import { LevilaminaPluginNotFoundError } from "./LevilaminaPluginNotFoundError";
import { PluginPackage } from "../packager/PluginPackage";


export class LevilaminaServer {
    private static deleteDirectory(basePath: string): void {
        if (File.existsSync(basePath)) {
            File.readdirSync(basePath).forEach((file: string): void => {
                const currentPath: string = Path.join(basePath, file);

                if (File.lstatSync(currentPath).isDirectory()) {
                    LevilaminaServer.deleteDirectory(currentPath);
                } else {
                    File.unlinkSync(currentPath);
                }
            });

            File.rmdirSync(basePath);
        }
    }

    private readonly pluginDirectory: string;

    public constructor(path: string) {
        this.pluginDirectory = Path.join(path, "plugins");
    }

    public removePlugin(pluginName: string): void {
        const pluginPath: string = Path.join(this.pluginDirectory, pluginName);

        if (File.existsSync(pluginPath)) {
            LevilaminaServer.deleteDirectory(pluginPath);
        } else {
            throw new LevilaminaPluginNotFoundError(pluginName);
        }
    }

    public async importPlugin(pluginPackage: PluginPackage): Promise<string> {
        await pluginPackage.expand(this.pluginDirectory);

        return `Plugin ${pluginPackage.getName()} has been imported to ${this.pluginDirectory}.`;
    }
}
