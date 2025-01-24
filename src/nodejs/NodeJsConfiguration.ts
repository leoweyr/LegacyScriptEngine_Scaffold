import * as Path from "path";
import * as File from "fs";

import { Project } from "../project/Project";
import { NodeJsConfigurationFileNotFoundError } from "./NodeJsConfigurationFileNotFoundError";
import { NodeJsConfigurationMissingError } from "./NodeJsConfigurationMissingError";


export class NodeJsConfiguration {
    private readonly filePath: string;

    public constructor(project: Project) {
        const projectPath: string = project.getPath();

        this.filePath = Path.join(projectPath, "package.json");

        if (!File.existsSync(this.filePath)) {
            throw new NodeJsConfigurationFileNotFoundError(projectPath);
        }
    }

    public getPath(): string {
        return this.filePath;
    }

    public getName(): string {
        const configuration: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));
        const name: string = configuration.name;

        if (!name) {
            throw new NodeJsConfigurationMissingError(this.filePath, "name");
        }

        return name;
    }

    public getVersion(): string {
        const configuration: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));
        const version: string = configuration.version;

        if (!version) {
            throw new NodeJsConfigurationMissingError(this.filePath, "version");
        }

        return version;
    }

    public getMainEntry(): string {
        const configuration: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));
        const mainEntry: string = configuration.main;

        if (!mainEntry) {
            throw new NodeJsConfigurationMissingError(this.filePath, "main");
        }

        return mainEntry;
    }
}
