const SCALAR_TYPE = 0x1;
const STRING_TYPE = 0x2;
const RAW_TYPE = 0x3;
const OBJECT_TYPE = 0x4;

class JSObject
{
    constructor(){
        this.name = null;
        this.entries = [];
    }

    isValidName(name){
        return (/^[A-Za-z][A-Za-z0-9_]*$/.test(name));
    }

    setName(name){
        if(! this.isValidName(name)) throw new Error("JSHelper.JSObject invalid name : "+name);
        this.name = name;
        return this;
    }

    addEntry(name, value, type){
        if(! this.isValidName(name)) throw new Error("JSHelper - invalid key value : "+name);

        this.entries.push({
            name: name,
            value: value,
            type: type
        });

        return this;
    }

    addScalarEntry(name, value){
        return this.addEntry(name, value, SCALAR_TYPE);
    }

    addRawEntry(name, value){
        return this.addEntry(name, value, RAW_TYPE);
    }

    addStringEntry(name, value){
        return this.addEntry(name, value, STRING_TYPE);
    }

    addObjectEntry(name, value){
        return this.addEntry(name, value, OBJECT_TYPE);
    }

    getName(){
        return this.name;
    }

    toScript(indentLevel=1){
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
            else if(entry.value===NaN){
                out += "NaN";
            }
            else{
                switch(entry.type){
                    case SCALAR_TYPE:
                        out += entry.value;
                        break;
                    case STRING_TYPE:
                        out += '"'+entry.value+'"';
                        break;
                    case RAW_TYPE:
                        out += entry.value;
                        break;
                    case OBJECT_TYPE:
                        out += entry.value.toScript(indentLevel+1);
                        break;
                }
            }
        }

        return out+"\n"+("    ".repeat(indentLevel-1))+"}";
    }
}

class JSWriter
{
    constuctor(use_strict=false){
        this.use_strict = use_strict;
        this.scripts = "'use strict';";
    }

    addConstant(obj){
        if(! obj instanceof JSObject) return null;

        if(this.scripts === undefined) this.scripts="";
        this.scripts += "\nconst "+obj.getName()+" = "+obj.toScript()+";";
        return this;
    }

    addVariable(obj){
        if(! obj instanceof JSObject) return null;
        
        if(this.scripts === undefined) this.scripts="";
        this.scripts += "\nvar "+obj.getName()+" = "+obj.toScript()+";";
        return this;
    }

    toScript(){
        return this.scripts;
    }
}

module.exports = {
    JWriter: JSWriter,
    JObject: JSObject
};