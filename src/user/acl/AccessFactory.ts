/**
 * Helper class to make list of access control
 *
 * @class
 */
import {AccessMap} from "./Access";

export class AccessFactory {

    static union( ...accesses:AccessMap[]):AccessMap {
        let o:AccessMap = {};
        for(let k in accesses){
            for(let i in accesses[k])
                o[i] = accesses[k][i];
        }
        return o;
    }
}