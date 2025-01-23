import { NodeJsConfiguration } from "../nodejs/NodeJsConfiguration";


export interface Project {
    getName(): string;
    getPath(): string;
    getBuiltPath(): string;
    getNodeJsConfiguration(): NodeJsConfiguration;
    isBuilt(): boolean;
    isManifest(): boolean;
}
