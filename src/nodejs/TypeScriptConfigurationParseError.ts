import { CliLoggableError } from "../cli/CliLoggableError";
import { Diagnostic } from "typescript";


export class TypeScriptConfigurationParseError extends Error implements CliLoggableError {
    private readonly msg: string;
    private readonly diagnostics: Array<Diagnostic> | null;

    public constructor(filePath: string, diagnostics: Array<Diagnostic> | null = null) {
        const message: string = `Failed to parse ${filePath}.`;

        super(message);

        this.msg = message;
        this.diagnostics = diagnostics;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();
        suggestion.push("Try checking the tsconfig.json.");

        if (this.diagnostics !== null) {
            suggestion.push(
                `Try to resolve the issue based on the diagnostic information from the TypeScript compiler: ${JSON.stringify(this.diagnostics)}`
            );
        }

        return suggestion;
    }
}
