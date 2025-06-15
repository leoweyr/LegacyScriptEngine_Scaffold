import * as File from "fs";
import * as Path from "path";

import * as Unzipper from "unzipper";

import { PluginPackageNotFoundError } from "./PluginPackageNotFoundError";


export class PluginPackage {
    private readonly name: string;
    private readonly filePath: string;

    public constructor(pluginName: string, filePath: string) {
        this.name = pluginName;
        this.filePath = filePath;
    }

    public getName(): string {
        return this.name;
    }

    public getPath(): string {
        return this.filePath;
    }

    public async expand(destinationPath: string): Promise<void> {
        if (!File.existsSync(this.filePath)) {
            throw new PluginPackageNotFoundError();
        }

        const pluginPackage: Unzipper.CentralDirectory = await Unzipper.Open.file(this.filePath);
        const extractedPath: string = Path.join(destinationPath, this.name.replace("/", "-").replace("@", ""));
        await pluginPackage.extract({path: extractedPath});
    }
}
