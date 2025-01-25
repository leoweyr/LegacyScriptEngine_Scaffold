import { CliLoggableError } from "../cli/CliLoggableError";


export class PluginPackageNotFoundError extends Error implements CliLoggableError {
    private static MESSAGE: string = "Could not find the plugin package.";

    public constructor() {
        super(PluginPackageNotFoundError.MESSAGE);
    }

    public getMessage(): string {
        return PluginPackageNotFoundError.MESSAGE;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push("Try `npx lses pack` to pack the project.");

        return suggestion;
    }
}
