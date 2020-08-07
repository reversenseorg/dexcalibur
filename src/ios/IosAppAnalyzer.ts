import IosApplication from "./IosApplication";
import DexcaliburProject from "../DexcaliburProject";


export default class IosAppAnalyzer
{
    ctx:DexcaliburProject;

    constructor(pContext:DexcaliburProject) {
        this.ctx = pContext;
    }

    async scan(path:string):Promise<IosApplication>{
        return new IosApplication(this.ctx);
    }
}