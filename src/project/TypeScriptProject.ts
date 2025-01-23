import { Dirent } from "node:fs";
import * as File from "fs";
import * as Path from "path";

import { Project } from "./Project";
import { NodeJsConfiguration } from "../nodejs/NodeJsConfiguration";
import { TypeScriptConfiguration } from "../nodejs/TypeScriptConfiguration";
import { Manifest } from "../packager/Manifest";


export class TypeScriptProject implements Project {
    private static instance: TypeScriptProject;

    private static getDirectoryStructure(baseDirectory: string): Array<string> {
        const filePaths: Array<string> = new Array<string>();
        const directories: Array<string> = new Array<string>();
        directories.push(baseDirectory);

        while (directories.length > 0) {
            const currentDirectory: string = directories.pop()!;
            const directoryEntries: Array<Dirent> = File.readdirSync(currentDirectory, {withFileTypes: true});

            for (const directoryEntry of directoryEntries) {
                const absolutePath: string = Path.join(currentDirectory, directoryEntry.name);

                if (directoryEntry.isDirectory()) {
                    directories.push(absolutePath);
                } else {
                    filePaths.push(Path.relative(baseDirectory, absolutePath).replace(/\\/g, "/"));
                }
            }
        }

        return filePaths;
    }

    public static getInstance(): TypeScriptProject {
        if (!TypeScriptProject.instance) {
            const currentWordDirectory: string = process.cwd();
            TypeScriptProject.instance = new TypeScriptProject(currentWordDirectory);
        }

        return TypeScriptProject.instance;
    }

    private readonly path: string;
    private readonly nodeJsConfiguration: NodeJsConfiguration;
    private readonly typeScriptConfiguration: TypeScriptConfiguration;
    private readonly manifest: Manifest;

    private constructor(path: string) {
        this.path = path;
        this.nodeJsConfiguration = new NodeJsConfiguration(this);
        this.typeScriptConfiguration = new TypeScriptConfiguration(this);
        this.manifest = new Manifest(this);
    }

    public getName(): string {
        return this.nodeJsConfiguration.getName();
    }

    public getPath(): string {
        return this.path;
    }

    public getBuiltPath(): string {
        return this.typeScriptConfiguration.getEmittedDirectory();
    }

    public getNodeJsConfiguration(): NodeJsConfiguration {
        return this.nodeJsConfiguration;
    }

    public isBuilt(): boolean {
        const emittedDirectoryStructure: Array<string> = TypeScriptProject.getDirectoryStructure(
            this.typeScriptConfiguration.getEmittedDirectory()
        );
        const compiledDirectoryStructure: Array<string> = this.typeScriptConfiguration.getCompiledDirectoryStructure();

        return compiledDirectoryStructure.every((filePath: string): boolean => {
            return emittedDirectoryStructure.includes(filePath)
        });
    }

    public isManifest(): boolean {
        return Manifest.isValid(this.manifest.getPath());
    }
}
