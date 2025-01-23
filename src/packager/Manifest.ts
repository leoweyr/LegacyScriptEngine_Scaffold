import * as Path from "path";
import * as File from "fs";

import { Project } from "../project/Project";
import { PackageConfiguration } from "../nodejs/PackageConfiguration";


export class Manifest {
    private project: Project;

    public constructor(project: Project) {
        this.project= project;
    }

    public getPath(): string {
        return Path.join(this.project.getBuiltPath(), "manifest.json");
    }

    public generate(): void {
        const packageConfiguration: PackageConfiguration = this.project.getPackageConfiguration();
        const name: string = packageConfiguration.getName();
        const version: string = packageConfiguration.getVersion();
        const entry: string = packageConfiguration.getMainEntry();

        const manifest = {
            "name": name,
            "version": version,
            "type": "lse-nodejs",
            "entry": entry,
            "dependencies": [{"name": "legacy-script-engine-nodejs"}]
        };

        File.writeFileSync(this.getPath(), JSON.stringify(manifest, null, 2), "utf-8");
    }

    public static isValid(filePath: string): boolean {
        if (!File.existsSync(filePath)) {
            return false;
        }

        try {
            const data: string = File.readFileSync(filePath, "utf-8");
            const manifest: any = JSON.parse(data);

            return manifest.hasOwnProperty("name") &&
                manifest.hasOwnProperty("version") &&
                manifest.hasOwnProperty("type") &&
                manifest.hasOwnProperty("entry") &&
                manifest.hasOwnProperty("dependencies");
        } catch (error) {
            return false;
        }
    }
}
