import * as Path from "path";
import * as File from "fs";

import { Project } from "../project/Project";


export class NodeJsConfiguration {
    private readonly filePath: string;

    public constructor(project: Project) {
        this.filePath = Path.join(project.getPath(), "package.json");
    }

    public getPath(): string {
        return this.filePath;
    }

    public getName(): string {
        const configuration: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));

        return configuration.name;
    }

    public getVersion(): string {
        const configuration: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));

        return configuration.version;
    }

    public getMainEntry(): string {
        const configuration: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));

        return configuration.main;
    }
}
