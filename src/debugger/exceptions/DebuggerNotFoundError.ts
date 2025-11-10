import { CliLoggableError } from "../../cli/exceptions/CliLoggableError";


export class DebuggerNotFoundError extends Error implements CliLoggableError {
    private readonly msg: string;

    public constructor(debuggerName: string) {
        const message: string = `Could not find LeviLamina server debugger ${debuggerName}.`;

        super(message);

        this.msg = message;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push("Try `npx lses debug <path> <name>` to launch the specific LeviLamina server debugger before.");
        suggestion.push("Check if the specified debugger name is correct.");

        return suggestion;
    }
}
