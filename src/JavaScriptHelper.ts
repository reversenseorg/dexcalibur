
enum JS_TYPES {
    UNDEFINED,
    SCALAR_TYPE,
    STRING_TYPE,
    RAW_TYPE,
    OBJECT_TYPE
}

export class JSObject
{
    name:string;
    entries:any;

    constructor(){
        this.name = null;
        this.entries = [];
    }

    isValidName(name:string):boolean{
        return (/^[A-Za-z][A-Za-z0-9_]*$/.test(name));
    }

    setName(name:string):JSObject{
        if(! this.isValidName(name)) throw new Error("JSHelper.JSObject invalid name : "+name);
        this.name = name;
        return this;
    }

    addEntry(name:string, value:any, type:JS_TYPES):JSObject{
        if(! this.isValidName(name)) throw new Error("JSHelper - invalid key value : "+name);

        this.entries.push({
            name: name,
            value: value,
            type: type
        });

        return this;
    }

    addScalarEntry(name:string, value:any):JSObject{
        return this.addEntry(name, value, JS_TYPES.SCALAR_TYPE);
    }

    addRawEntry(name:string, value:any):JSObject{
        return this.addEntry(name, value, JS_TYPES.RAW_TYPE);
    }

    addStringEntry(name:string, value:string):JSObject{
        return this.addEntry(name, value, JS_TYPES.STRING_TYPE);
    }

    addObjectEntry(name:string, value:any):JSObject{
        return this.addEntry(name, value, JS_TYPES.OBJECT_TYPE);
    }

    getName():string{
        return this.name;
    }

    toScript(indentLevel:number=1):string{
        let entry=null, out=`{
`;

        for(let i=0; i<this.entries.length; i++){
            if(i>0) out += ",\n";

            entry = this.entries[i];
            out += ("    ".repeat(indentLevel))+entry.name+": ";
            
            if(entry.value===null){
                out += "null";
            }
            else if(entry.value===undefined){
                out += "undefined";
            }
            else if(Number.isNaN(entry.value)){
                out += "NaN";
            }
            else{
                switch(entry.type){
                    case JS_TYPES.SCALAR_TYPE:
                        out += entry.value;
                        break;
                    case JS_TYPES.STRING_TYPE:
                        out += '"'+entry.value+'"';
                        break;
                    case JS_TYPES.RAW_TYPE:
                        out += entry.value;
                        break;
                    case JS_TYPES.OBJECT_TYPE:
                        out += entry.value.toScript(indentLevel+1);
                        break;
                }
            }
        }

        return out+"\n"+("    ".repeat(indentLevel-1))+"}";
    }
}

export class JSWriter
{
    use_strict:boolean = false;
    scripts:string;

    constuctor(use_strict=false){
        this.use_strict = use_strict;
        this.scripts = "";
        if(use_strict)
            this.scripts = "'use strict';";
    }

    addConstant(obj:any):JSWriter{
        if((obj instanceof JSObject)===false) return null;

        if(this.scripts === undefined) this.scripts="";
        this.scripts += "\nconst "+obj.getName()+" = "+obj.toScript()+";";
        return this;
    }

    addVariable(obj:any):JSWriter{
        if((obj instanceof JSObject)===false) return null;
        
        if(this.scripts === undefined) this.scripts="";
        this.scripts += "\nvar "+obj.getName()+" = "+obj.toScript()+";";
        return this;
    }

    toScript():string{
        return this.scripts;
    }
}
