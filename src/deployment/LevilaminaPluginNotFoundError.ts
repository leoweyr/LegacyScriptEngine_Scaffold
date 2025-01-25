export class LevilaminaPluginNotFoundError extends Error {
    public constructor(pluginName: string) {
        super(`Levilamina plugin ${pluginName} does not found.`);
    }
}
