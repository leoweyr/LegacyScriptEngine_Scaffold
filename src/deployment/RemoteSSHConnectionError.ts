import { CliLoggableError } from "../cli/CliLoggableError";
import { LeviLaminaServer } from "./LeviLaminaServer";


export class RemoteSSHConnectionError extends Error implements CliLoggableError {
    private readonly msg: string;

    public constructor(leviLaminaServer: LeviLaminaServer) {
        const message: string = `Could not connect to ${leviLaminaServer.getRemoteAddress(true)}.`;

        super(message);

        this.msg = message;
    }

    public getMessage(): string {
        return this.msg;
    }

    public getSuggestion(): Array<string> {
        const suggestion: Array<string> = new Array<string>();

        suggestion.push("Ensure the SSH connection is working.");
        suggestion.push("Ensure the SSH connection is not blocked by a firewall.");
        suggestion.push("Ensure the SSH connection is not blocked by a proxy.");
        suggestion.push("Ensure the SSH connection is not blocked by a VPN.");
        suggestion.push("Ensure the SSH connection is not blocked by a NAT.");
        suggestion.push("Ensure the SSH username and password are correct.");

        return suggestion;
    }
}
