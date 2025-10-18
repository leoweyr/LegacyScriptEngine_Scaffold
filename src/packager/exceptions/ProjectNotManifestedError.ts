import { CliLoggableError } from "../../cli/exceptions/CliLoggableError";


export class ProjectNotManifestedError extends Error implements CliLoggableError {
    private static MESSAGE: string = "Project is not manifested.";

    public constructor() {
        super(ProjectNotManifestedError.MESSAGE);
    }

    getMessage(): string {
        return ProjectNotManifestedError.MESSAGE;
    }

    getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push("Try `npx lses manifest` to manifest the project.");

        return suggestion;
    }
}
