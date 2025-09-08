import {Struct} from "@dexcalibur/dxc-struct";


export type BinTplField = string;
export type BinTplFmt = string;

export type BinTpl = [BinTplFmt, BinTplField | undefined];


export interface BinProcessState<T> {
    res: T,
    offset: number
}

export class BinTplHelper {

    /**
     *
     * @param pTpl
     * @param pBuffer
     * @param pOffset
     */
    static unpackTpl<T>(pTpl:BinTpl, pBuffer:Buffer, pOffset:number):BinProcessState<T> {
        const v = Struct.unpack(pTpl[0], pBuffer, pOffset);
        return {
            res: (pTpl[1]!=undefined ? [pTpl[1],v]: v),
            offset: pOffset+Struct.calcLength(pTpl[0],v)
        };
    }

    /**
     *
     * @param pTpl
     * @param pBuffer
     * @param pOffset
     */
    static unpack<T>(pTpl:BinTpl[], pBuffer:Buffer, pOffset:number):BinProcessState<any> {

        let res:T[] = [], state:BinProcessState<any>, o=pOffset;
        for(let i=0;i<pTpl.length; i++){
            state = BinTplHelper.unpackTpl(pTpl[i], pBuffer, o);
            o = state.offset;
            if(state.res != null){
                res.push(state.res);
            }
        }

        return { res:res, offset:o };
    }

    /**
     *
     * @param pTpl
     * @param pBuffer
     * @param pOffset
     */
    static unpackObject<T>(pTpl:BinTpl[], pBuffer:Buffer, pOffset:number):BinProcessState<T> {
        let s = BinTplHelper.unpack<T>(pTpl, pBuffer, pOffset);
        s.res.map(x => {
            if(x.length>1 && x[1].length>0) x[1] = x[1][0];
        });
        s.res = Object.fromEntries(s.res);
        return s;
    }
}