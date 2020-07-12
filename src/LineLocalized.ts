
const OLINE = 1;
const ILINE = 1<<1;

export default class LineLocalized
{
    _:any = {};

    setSourceLine(line:number){
        this._[OLINE] = line;
    }
    getSourceLine():number{
        return this._[OLINE];
    }
    setBinaryLine(line:number){
        this._[ILINE] = line;
    }
    getBinaryLine():number{
        return this._[ILINE];
    }
}