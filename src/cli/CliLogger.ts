import { CliLoggableError } from "./CliLoggableError";


export class CliLogger {
    private static TOOL_NAME: string = "legacy-script-engine-scaffold";

    private readonly methodName: string;

    public constructor(methodName: string) {
        this.methodName = methodName;
    }

    public success(msg: string): void {
        console.log(
            `✅ ${CliLogger.TOOL_NAME}::${this.methodName}: ${msg}`
        )
    }

    public error(error: CliLoggableError): void {
        let suggestionString: string = "";

        if (error.getSuggestion().length === 1) {
           suggestionString += `Suggestion: ${error.getSuggestion()[0]}`;
        } else {
            suggestionString += "Suggestions:\n";

            let solutionIndex: number = 1;

            for (const solution of error.getSuggestion()) {
                suggestionString += `   ${solutionIndex}. ${solution}\n`;
                solutionIndex++;
            }

            suggestionString = suggestionString.slice(0, -2);  // Remove the last newline.
        }

        console.error(
            `❌ ${CliLogger.TOOL_NAME}::${this.methodName}: ${error.constructor.name} - ${error.getMessage()}\n   ${suggestionString}`
        );
    }
}
