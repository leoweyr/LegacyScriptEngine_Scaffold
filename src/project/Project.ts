import { PackageConfiguration } from "../nodejs/PackageConfiguration";
import { Manifest } from "../packager/Manifest";


export interface Project {
    getName(): string;
    getPath(): string;
    getBuiltPath(): string;
    getPackageConfiguration(): PackageConfiguration;
    getManifest(): Manifest;
    isBuilt(): boolean;
    isManifest(): boolean;
}
