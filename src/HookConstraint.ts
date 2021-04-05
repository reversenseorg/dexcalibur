import ModelFile from "./ModelFile";

export class HookConstraint {

    dex:ModelFile[] = [];
    lib:ModelFile[] = [];

    constructor() {

    }

    requireLib( pFile:ModelFile):HookConstraint {
        this.lib.push(pFile);

        return this;
    }

    requireDex( pFile:ModelFile):HookConstraint {
        this.dex.push(pFile);

        return this;
    }

    isDexDependant():boolean {
        return (this.dex.length>0);
    }
}