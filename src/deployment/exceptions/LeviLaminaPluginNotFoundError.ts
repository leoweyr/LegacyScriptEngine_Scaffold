export class LeviLaminaPluginNotFoundError extends Error {
    public constructor(pluginName: string) {
        super(`LeviLamina plugin ${pluginName} does not found.`);
    }
}
