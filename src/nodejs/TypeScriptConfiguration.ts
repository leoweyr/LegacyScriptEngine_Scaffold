import * as Path from "path";

import ts, { ParsedCommandLine, Program } from "typescript";

import { Project } from "../project/Project";


export class TypeScriptConfiguration {
    private static parseFile(filePath: string): ParsedCommandLine {
        const file: any = ts.readConfigFile(filePath, ts.sys.readFile);

        if (file.error) {
            throw new Error("Error reading tsconfig.json.");
        }

        const parsedCommandLine: ParsedCommandLine = ts.parseJsonConfigFileContent(
            file.config,
            ts.sys,
            Path.dirname(filePath)
        );

        if (parsedCommandLine.errors.length > 0) {
            throw new Error(`Error parsing tsconfig.json: ${JSON.stringify(parsedCommandLine.errors)}.`);
        }

        return parsedCommandLine;
    }

    private readonly filePath: string;

    public constructor(project: Project) {
        this.filePath = Path.join(project.getPath(), "tsconfig.json");
    }

    public getEmittedDirectory(): string {
        const parsedCommandLine: ParsedCommandLine = TypeScriptConfiguration.parseFile(this.filePath);
        const emittedDirectory: string | undefined = parsedCommandLine.options.outDir;

        if (!emittedDirectory) {
            throw new Error("No `outDir` configuration in tsconfig.json.");
        }

        return emittedDirectory;
    }

    public getCompiledDirectoryStructure(): Array<string> {
        const parsedCommandLine: ParsedCommandLine = TypeScriptConfiguration.parseFile(this.filePath);

        const program: Program = ts.createProgram({
            rootNames: parsedCommandLine.fileNames,
            options: parsedCommandLine.options,
        });

        const emittedFilePaths: Array<string> = new Array<string>();
        const emittedDirectory: string = this.getEmittedDirectory();

        program.emit(undefined, (fileName: string): void => {
            emittedFilePaths.push(fileName);
        });

        return emittedFilePaths.map((filePath: string): string => {
            return Path.relative(emittedDirectory, filePath).replace(/\\/g, "/")
        });
    }
}
