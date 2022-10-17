import { F2FileSystem } from "./f2fs/F2FileSystem";
import { FileSystemMountOptions } from "./FileSystemMountOptions";


/**
 * @class
 * @since 1.1.0
 */
export default class FileSystemFactory {



    static parseMountOptions( pFS:string, pOpts:any[]):FileSystemMountOptions {
        let opts:FileSystemMountOptions = {};

        switch (pFS){
            case "f2fs":
                opts = F2FileSystem.parseMountOptions(pOpts);
                break;
        }

        return opts;
    }
}