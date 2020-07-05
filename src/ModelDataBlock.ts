import ModelMethod from "./ModelMethod";


export default class ModelDataBlock
{
    line:number = -1;
    offset:number = -1;
    stack = [];
    tag = null;
    tags:string[] = [];
    name:string = null;
    values:any = [];
    width:number = 0;
    length:number = 0;
    uid:string = null;
    virtual64:boolean = false;
    parent:ModelMethod = null;

    constructor(dataWidth:number=null){

        this.width = dataWidth;
        this.virtual64 = false;

        if(64==dataWidth && this.values.readBigUInt64LE == null){
            this.virtual64 = true;
            this.values = [];
        }
    }

    getUID():string{
        return this.uid;
    }

    setParent(parent:ModelMethod, offset:number){
        if(!(parent instanceof ModelMethod))
            throw Error("The parent of this DataBlock is not a function.");

        this.parent = parent;
        this.uid = this.parent.signature();
        this.uid += ":";
        this.uid += (this.name != null)? this.name : 'data_'+offset;
    }

    pushData(val:any, isNegative:boolean, isShort:boolean){

        this.values.push(new Number(val));
        if(isNegative)
            this.values.push( new Number(-this.values.pop() ));

        this.length++;
        //Logger.debug( (isNegative?'-':'+')+val, this.values[this.values.length-1].toString(16) );
    }

    read(offset:number){
        return this.values[offset];
    }


    size():number{
        return this.length * (this.width >> 3);
    }

    count():number{
        return this.length;
    }

    getByteWidth():number{
        return this.width>>3;
    }

    isInt64Array():boolean{
        return (this.width == 64);
    }

    setDataWidth(width:number){
        switch(width){
            case 1:
                this.width = 8;
                break;
            case 2:
                this.width = 16;
                break;
            case 4:
                this.width = 32;
                break;
            case 8:
                this.width = 64;
                if(this.values.readBigUInt64LE == null){
                    this.virtual64 = true;
                    this.values = [];
                }
                break;
        }
    }


    toJsonObject(exclude:any=[]){
        let o:any = new Object();
        for(let i in this){
            if(exclude.indexOf(i)>-1) continue;
            if(this[i]==null) continue;
            switch(i){
                case "tags":
                    if(this.tags.length > 0)
                        o[i] = this[i];
                    break;
                case "line":
                case "offset":
                    if(this.offset > -1)
                        o[i] = this[i];
                    break;
                case "name":
                case "length":
                case "width":
                case "uid":
                    o[i] = this[i];
                    break;
                case "parent":
                    o.parent = this.parent.signature();
                    break;
                case "values":
                    o.values = this.values;
                    break;
            }
        }
        console.log(JSON.stringify(this.values));
        return o;
    }
}