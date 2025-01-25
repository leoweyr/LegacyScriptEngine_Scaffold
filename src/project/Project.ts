import { NodeJsConfiguration } from "../nodejs/NodeJsConfiguration";
import { Manifest } from "../packager/Manifest";


export interface Project {
    getName(): string;
    getPath(): string;
    getBuiltPath(): string;
    getNodeJsConfiguration(): NodeJsConfiguration;
    getManifest(): Manifest;
    isBuilt(): boolean;
    isManifest(): boolean;
}
