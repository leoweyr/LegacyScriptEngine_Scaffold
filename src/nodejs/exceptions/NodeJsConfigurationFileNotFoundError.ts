import { CliLoggableError } from "../../cli/exceptions/CliLoggableError";


export class NodeJsConfigurationFileNotFoundError extends Error implements CliLoggableError {
    private readonly msg: string;

    public constructor(fileDirectory: string) {
        const message: string = `Could not find package.json in ${fileDirectory}.`;

        super(message);

        this.msg = message;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();
        suggestion.push("Try `npm init` to initialize the project.");

        return suggestion;
    }
}
