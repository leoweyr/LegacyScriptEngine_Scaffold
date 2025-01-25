export interface CliLoggableError {
    getMessage(): string;
    getSuggestion(): Array<string>;
}
