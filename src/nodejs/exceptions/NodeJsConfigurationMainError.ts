import { CliLoggableError } from "../../cli/exceptions/CliLoggableError";


export class NodeJsConfigurationMainError extends Error implements CliLoggableError {
    private static MESSAGE: string = "The `main` configuration in package.json is incorrect.";

    public constructor() {
        super(NodeJsConfigurationMainError.MESSAGE);
    }

    public getMessage(): string {
        return NodeJsConfigurationMainError.MESSAGE;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push("Ensure the `main` field is set to be relative to the project's working directory.");

        return suggestion;
    }
}
