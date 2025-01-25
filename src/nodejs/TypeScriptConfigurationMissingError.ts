import { CliLoggableError } from "../cli/CliLoggableError";


export class TypeScriptConfigurationMissingError extends Error implements CliLoggableError {
    private readonly msg: string;
    private readonly missingProperty: string;

    public constructor(filePath: string, missingProperty: string) {
        const message: string = `${filePath} is missing the required property \`${missingProperty}\`.`;

        super(message);

        this.msg = message;
        this.missingProperty = missingProperty;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();
        suggestion.push(`Try checking if tsconfig.json includes the \`${this.missingProperty}\` configuration.`);

        return suggestion;
    }
}
