import { CliLoggableError } from "../../cli/exceptions/CliLoggableError";
import { LeviLaminaServer } from "../LeviLaminaServer";


export class RemoteSSHFileUploadError extends Error implements CliLoggableError {
    private readonly msg: string;

    public constructor(sourceFilePath: string, leviLaminaServer: LeviLaminaServer) {
        const message: string = `Failed to upload ${sourceFilePath} to LeviLamina ${leviLaminaServer.getRootPath()} in ${leviLaminaServer.getRemoteAddress(false)}.`;

        super(message);

        this.msg = message;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();
        suggestion.push("Check the network connection.");
        suggestion.push("Check the SSH user permissions for file upload.");
        suggestion.push("Check the available disk space on the remote server.");

        return suggestion;
    }
}
