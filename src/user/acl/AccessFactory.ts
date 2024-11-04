/**
 * Helper class to make list of access control
 *
 * @class
 */
import {Access, AccessMap} from "./Access.js";

export class AccessFactory {

    /**
     * @deprecated
     * @param accesses
     */
    static union( ...accesses:AccessMap[]):AccessMap {
        let o:AccessMap = {};
        for(let k in accesses){
            for(let i in accesses[k])
                o[i] = accesses[k][i];
        }
        return o;
    }


    /**
     *
     * @param pAccesses
     */
    static merge( ...pAccesses:Access[][]):Access[] {
        let o:Access[] = [];
        for(let k in pAccesses ){
            for(let i in pAccesses[k])
                o.push(pAccesses[k][i]);
        }
        return o;
    }
}