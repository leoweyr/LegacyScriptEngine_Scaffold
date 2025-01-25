import * as File from "fs";
import * as Path from "path";

import archiver, { Archiver, ArchiverError } from "archiver";

import { Project } from "../project/Project";
import { ProjectNotBuiltError } from "./ProjectNotBuiltError";
import { ProjectNotManifestedError } from "./ProjectNotManifestedError";


export class Packager {
    private project: Project;

    public constructor(project: Project) {
        this.project = project;
    }

    public async package(): Promise<string> {
        if (!this.project.isBuilt()) {
            throw new ProjectNotBuiltError();
        }

        if (!this.project.isManifest()) {
            throw new ProjectNotManifestedError();
        }

        File.copyFileSync(
            this.project.getNodeJsConfiguration().getPath(),
            Path.join(this.project.getBuiltPath(), "package.json")
        );

        const outputStream: File.WriteStream = File.createWriteStream(
            Path.join(this.project.getPath(), `${this.project.getName()}.zip`)
        );

        const archive: Archiver = archiver("zip", {zlib: {level: 9}});

        archive.on("error", (error: ArchiverError): never => {
            throw error;
        });

        archive.pipe(outputStream);
        archive.directory(this.project.getBuiltPath(), false);
        await archive.finalize();

        return `The package has been generated at ${outputStream.path}.`;
    }
}
