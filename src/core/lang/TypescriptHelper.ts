import * as _ts_ from "typescript";

// @ts-ignore
const TS = _ts_.default;

export class TypescriptHelper {

    /**
     * To transpile Typescript code to JS code at runtime
     * @param pSource
     */
    static transpile(pSource:string):any {
        const s = TS.transpileModule(pSource, {
            compilerOptions: {
                module: TS.ModuleKind.ES2020
            }
        });

        //Logger.debugRAW(s);
        return s.outputText;
    }
}

/**

 (pEvent.data as ModelFile).tags.push(pCtx.getTagManager().getTag("keystore.type.bks").getUUID());
 */