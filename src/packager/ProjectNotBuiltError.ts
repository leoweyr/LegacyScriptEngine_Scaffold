import { CliLoggableError } from "../cli/CliLoggableError";


export class ProjectNotBuiltError extends Error implements CliLoggableError {
    private static MESSAGE: string = "Project is not built.";

    public constructor() {
        super(ProjectNotBuiltError.MESSAGE);
    }

    getMessage(): string {
        return ProjectNotBuiltError.MESSAGE;
    }

    getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push("Try checking if tsconfig.json includes the `include` configuration.");
        suggestion.push("Try checking if tsconfig.json includes the `outDir` configuration.");
        suggestion.push("Try `npx tsc` to build the project if it is a TypeScript project.");

        return suggestion;
    }
}
