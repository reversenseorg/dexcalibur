/**
 * @class
 * @since 1.1.0
 */
import {F2FileSystemMountOptions} from "./F2FileSystemMountOptions.js";

export class F2FileSystem {

    static parseMountOptions( pOptions:any[]){
        return new F2FileSystemMountOptions(Object.values(pOptions));
    }
}