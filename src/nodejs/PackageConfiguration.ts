import * as Path from "path";
import * as File from "fs";

import { Project } from "../project/Project";


export class PackageConfiguration {
    private readonly filePath: string;

    public constructor(project: Project) {
        this.filePath = Path.join(project.getPath(), "package.json");
    }

    public getPath(): string {
        return this.filePath;
    }

    public getName(): string {
        const packageJson: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));

        return packageJson.name;
    }

    public getVersion(): string {
        const packageJson: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));

        return packageJson.version;
    }

    public getMainEntry(): string {
        const packageJson: any = JSON.parse(File.readFileSync(this.filePath, "utf-8"));

        return packageJson.main;
    }
}
