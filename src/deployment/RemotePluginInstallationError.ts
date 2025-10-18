import { CliLoggableError } from "../cli/CliLoggableError";
import { LeviLaminaServer } from "./LeviLaminaServer";


export class RemotePluginInstallationError extends Error implements CliLoggableError {
    private readonly msg: string;
    private readonly leviLaminaServer: LeviLaminaServer;

    public constructor(leviLaminaServer: LeviLaminaServer) {
        const message: string = `Failed to install plugin package to LeviLamina ${leviLaminaServer.getRootPath()} in ${leviLaminaServer.getRemoteAddress(false)}.`;

        super(message);

        this.msg = message;
        this.leviLaminaServer = leviLaminaServer;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push(`Check the SSH user permissions in ${this.leviLaminaServer.getRootPath()} of ${this.leviLaminaServer.getRemoteAddress(false)}.`)
        suggestion.push("Check the available disk space on the remote server.")

        return suggestion;
    }
}
