import { CliLoggableError } from "../cli/CliLoggableError";


export class ManifestFileNotFoundError extends Error implements CliLoggableError{
    private readonly msg: string;

    public constructor(fileDirectory: string) {
        const message: string = `Could not find manifest.json in ${fileDirectory}.`;

        super(message);

        this.msg = message;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();
        suggestion.push("Try `npx lses manifest` to manifest the project.");

        return suggestion;
    }
}
