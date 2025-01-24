import * as Path from "path";
import * as File from "fs";

import { Project } from "../project/Project";
import { NodeJsConfiguration } from "../nodejs/NodeJsConfiguration";
import { ManifestFileNotFoundError } from "./ManifestFileNotFoundError";
import { ManifestConfigurationMissingError } from "./ManifestConfigurationMissingError";


export class Manifest {
    private project: Project;

    public constructor(project: Project) {
        this.project= project;
    }

    public getPath(): string {
        return Path.join(this.project.getBuiltPath(), "manifest.json");
    }

    public getName(): string {
        if (!File.existsSync(this.getPath())) {
            throw new ManifestFileNotFoundError(this.project.getBuiltPath());
        }

        const manifest: any = JSON.parse(File.readFileSync(this.getPath(), "utf-8"));
        const name: string = manifest.name;

        if (!name) {
            throw new ManifestConfigurationMissingError(this.getPath(), "name");
        }

        return name;
    }

    public generate(): string {
        const nodeJsConfiguration: NodeJsConfiguration = this.project.getNodeJsConfiguration();
        const name: string = nodeJsConfiguration.getName();
        const version: string = nodeJsConfiguration.getVersion();
        const entry: string = nodeJsConfiguration.getMainEntry();

        const manifest = {
            "name": name,
            "version": version,
            "type": "lse-nodejs",
            "entry": entry,
            "dependencies": [{"name": "legacy-script-engine-nodejs"}]
        };

        File.writeFileSync(this.getPath(), JSON.stringify(manifest, null, 2), "utf-8");

        return `The manifest has been generated at ${this.getPath()}.`;
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
