var fs = require('fs');
var Chalk = require("chalk");
var Process = require("child_process");

const CONST = require('./CoreConst.js');
const Core = require("./CoreClass.js");
const INSTR = require("./Opcode.js");

var JSONutil = require("util");

var cyclicDebug = []
var cycleMax = 8;

let STUB=Core.STUB_TYPE;


function findCyclicRef(obj,fullPath=[],endPath=[],cycle=0){
    let path = fullPath, end=endPath, k=0;
    if(cycle>cycleMax){
        //console.log("[E] Max cycle : "+path.join('.'));
        return false;
    }

    for(let i in obj){

        if(path.length == 0 && (k%200 == 0)){
            console.log("\tStatus : "+k+" nodes scanned");
            k++;
        }
        
        if(typeof obj[i] === 'object'){
            path.push(i);
            if(obj[i] instanceof Core.Class){
                cyclicDebug.push("Class "+i+" > "+path.join('/'));
                console.log(fullPath);
                console.log("Cycling : "+path.join('.'));
                path.pop();
            }
            else if(obj[i] instanceof Core.Method){
                cyclicDebug.push("Method :"+path.join('/'));
                console.log("Cycling : "+path.join('.'));
                path.pop();
            }
            else if(obj[i] instanceof Core.Field){
                cyclicDebug.push("Field :"+path.join('/'));
                console.log("Cycling : "+path.join('.'));
                path.pop();
            }
            else if(obj[i] instanceof Core.MissingReference){
                cyclicDebug.push("MissingRef :"+path.join('/'));
                console.log("Cycling : "+path.join('.'));
                path.pop();
            }
            else{
                findCyclicRef(obj[i],path,[],cycle+1);
                path.pop();
            }
        }
        else if(typeof obj[i] === 'array'){
            path.push(i);
            console.log("Cycling : "+path.join('/'));
            findCyclicRef(obj[i],path,[],cycle+1);
            path.pop();
        }   

    }

    return true;
}


function CircularReference(type,id){
    this.$ = 0x4;
    this.type = type;
    this.id = id;

    return this;
}

function MultipleReference(type,id){
    this.type = type;
    this.id = id;

    return this;
}

/*
function Stub(type,data,exclude){
    this.__type__ = type;

    for(let i in data){
        if(exclude.indexOf(i)==-1)
            this[i]=data[i]
    };

    return this;
}*/

function save(data,file){
    let tab={}, src={}, block=null;


    for(let i in data.classes){
        tab[data.classes[i].name] = new Core.Stub(
            STUB.CLASS,
            data.classes[i],
            ['methods','fields','extends','implements','enclosingClass','innerClass','_callers']
        );

        if(data.classes[i]._val !== undefined 
            && (data.classes[i]._val instanceof Core.Class)){

            console.log("Missing class found at top level");

            tab[data.classes[i].name] = new Core.Stub(
                STUB.MISSING,
                data.classes[i],
                ['methods','fields','extends','implements','enclosingClass','innerClass','_callers','_val']
            );
            tab[data.classes[i]].name.__srcType__ = STUB.CLASS;
        }

        
        for(let k in data.classes[i].methods){
            tab[data.classes[i].methods[k].signature()] = new Core.Stub(
                STUB.METHOD,
                data.classes[i].methods[k],
                ['instr','enclosingClass','declaringClass','_useClass','_useMethod','_useField','_callers']                    
            );
        }

        for(let k in data.classes[i].fields){
            tab[data.classes[i].fields[k].signature()] = new Core.Stub(
                STUB.FIELD,
                data.classes[i].fields[k],
                ['enclosingClass','_callers']                    
            );
        }
    }

    
    // create an unique list containing all objects
    // replace circular reference by ID 
    for(let i in data.classes){
        src = data.classes[i];

        if(src.enclosingClass !== null){
            tab[src.name].enclosingClass = new CircularReference(
                STUB.CLASS,
                src.enclosingClass.name
            );
        }

        if(src.extends !== null){
            tab[src.name].extends = new CircularReference(
                STUB.CLASS,
                src.extends.name
            );
        }

        if(src.innerClass.length > 0){
            tab[src.name].innerClass = [];
            for(let j in src.innerClass){
                tab[src.name].innerClass[j] = new CircularReference(
                    STUB.CLASS,
                    j
                );
            }

        }

        if(src.implements.length > 0){
            tab[src.name].implements = [];
            for(let j in src.implements){
                tab[src.name].implements.push(
                    new CircularReference(
                        STUB.CLASS,
                        src.implements[j].name
                    )
                );
            }
        }

        // ._callers[*] references
        if(src._callers.length > 0){
            tab[src.name]._callers = [];
            for(let j in src._callers){
                tab[src.name]._callers.push(
                    new CircularReference(
                        STUB.METHOD,
                        src._callers[j].signature()
                    )
                );
            }
        }

        // .methods[*] references
        if(src.methods !== null){
            for(let k in src.methods){
                id = src.methods[k].signature();
                
                // INSTRUCTIONS
                tab[id].instr = [];
                if(src.methods[k].instr.length > 0){

                    for(let l in src.methods[k].instr){
                        block = src.methods[k].instr[l];
                        bbstub = new Core.Stub(
                            STUB.BASIC_BLOCK,
                            block,
                            ['stack']
                        );
                        
                        bbstub.stack = [];
                        for(let m in block.stack){
                            istub = new Core.Stub(
                                STUB.INSTR,
                                block.stack[m],
                                ['opcode','right']
                            );

                            istub.opcode = new MultipleReference(
                                STUB.OPCODE,
                                block.stack[m].opcode.byte
                            );

                            if(block.stack[m].right instanceof Core.Field){
                                istub.right = new CircularReference(
                                    STUB.FIELD,
                                    block.stack[m].right.signature()
                                );
                            }
                            else if(block.stack[m].right instanceof Core.Method){
                                istub.right = new CircularReference(
                                    STUB.METHOD,
                                    block.stack[m].right.signature()
                                );
                            }
                            else if(block.stack[m].right instanceof Core.Class){
                                istub.right = new CircularReference(
                                    STUB.METHOD,
                                    block.stack[m].right.name
                                );
                            }
                            /*
                            else if(block.stack[m].right instanceof Core.StringValue){
                                istub.right = new CircularReference(
                                    STUB.STRING,
                                    block.stack[m].right.name
                                );
                            }*/
                            else if(block.stack[m].right instanceof Core.MissingReference){
                                
                                if(block.stack[m].right.signature !== undefined){
                                    istub.right = new CircularReference(
                                        STUB.MISSING,
                                        block.stack[m].right.signature()
                                    );
                                }else{
                                    istub.right = new CircularReference(
                                        STUB.MISSING,
                                        block.stack[m].name
                                    );
                                }

                                switch(block.stack[m].right._type){
                                    case CONST.OPCODE_REFTYPE.FIELD:
                                        istub.right.__srcType__ = STUB.FIELD;
                                        break;
                                    case CONST.OPCODE_REFTYPE.METHOD:
                                        istub.right.__srcType__ = STUB.METHOD;
                                        break;
                                    case CONST.OPCODE_REFTYPE.CLASS:
                                        istub.right.__srcType__ = STUB.CLASS;
                                        break;
                                }
                        
                                
                            }else{

                                istub.right = block.stack[m].right;
                            }

                            bbstub.stack.push(istub);
                        }

                        tab[id].instr.push(bbstub);
                    }
                }

                // CALLERS
                if(src.methods[k]._callers.length > 0){
                    tab[id]._callers = [];
                    for(let j in src.methods[k]._callers){
                        tab[id]._callers.push(
                            new CircularReference(
                                STUB.METHOD,
                                src.methods[k]._callers[j].signature()
                            )
                        );
                    }
                }

                tab[id]._useMethod = {};
                for(let l in src.methods[k]._useMethod){
                    tab[id]._useMethod[l] = [];
                    for(let m in src.methods[k]._useMethod[l]){
                        tab[id]._useMethod[l][m] = new CircularReference(
                            STUB.METHOD,
                            l
                        );
                    }
                }

                tab[id]._useField = {};
                for(let l in src.methods[k]._useField){
                    tab[id]._useField[l] = [];
                    for(let m in src.methods[k]._useField[l]){
                        tab[id]._useField[l][m] = new CircularReference(
                            STUB.FIELD,
                            l
                        );
                    }
                }

                tab[id]._useClass = {};
                for(let l in src.methods[k]._useClass){
                    tab[id]._useClass[l] = [];
                    for(let m in src.methods[k]._useClass[l]){
                        tab[id]._useClass[l][m] = new CircularReference(
                            STUB.CLASS,
                            l
                        );
                    }
                }
                
                tab[src.methods[k].signature()].enclosingClass  = new CircularReference(
                    STUB.CLASS,
                    src.name
                );

                if(src.methods[k].declaringClass !== undefined && (src.methods[k].declaringClass instanceof Core.Class)){
                    tab[src.methods[k].signature()].declaringClass = new CircularReference(
                        STUB.CLASS,
                        src.methods[k].declaringClass.name
                    );
                }
            };


        }

        // Class.fields[*] references        
        if(src.fields !== null){
            for(let k in src.fields){
                fieldSign = src.fields[k].signature();

                // ._callers[*] references
                if(src.fields[k]._callers.length > 0){
                    tab[fieldSign]._callers = [];
                    for(let j in src.fields[k]._callers){
                        tab[fieldSign]._callers.push(
                            new CircularReference(
                                STUB.METHOD,
                                src.fields[k]._callers[j].name
                            )
                        );
                    }
                }

                // .enclosingClass references
                if(src.enclosingClass !== null){
                    tab[fieldSign].enclosingClass = new CircularReference(
                        STUB.CLASS,
                        src.enclosingClass.name
                    );
                }
            }
        }
    }

    //return tab;
    
    /*
    console.log("[*] Class/method/field exported : "+tab.length); 
    console.log("[*] Checking for cycling reference :")
    findCyclicRef(tab);
    
    if(cyclicDebug.length > 0){
        console.log(Chalk.bold.red("[E] Error : cycling references detected."));
        for(let i in cyclicDebug){
            console.log("\t"+cyclicDebug[i]);
        }
        return;
    }
        
    let json = JSONutil.inspect(tab);*/
    // into each object replace reference by the corresponding ID
    fs.writeFileSync(file+".tmp", JSON.stringify(tab));
    console.log(Chalk.green("[*] Compressing... "))
    
    Process.exec("/usr/bin/zip "+file+".zip "+file+".tmp");
    console.log(Chalk.green("[*] Saved sucessfully. "))

    //fs.unlinkSync(file+".tmp");

    return ;
}


/**
 * Return map
 * @param {*} file 
 */
function restore(filepath){
    let src=null, db=[];

    // unzip file
    Process.exec("unzip "+filepath);


    // read save file
    src=fs.readFileSync(filepath.substr(0,filepath.lastIndexOf("/"))+"/"+filepath.replace(".zip",".tmp"),'ascii');
    src=JSON.parse(src);

    // create corresponding obj for each Stub
    for(let i in src){
        if(src[i].__type__==REF.CLASS){
            db[i] = new Core.Class(src[i]);
            db[i].import(src[i]);

            // search obj from circular ref
            for(let j in src[i].fields){
                db[i].fields[j] = new Core.Field();
                db[i].fields[j].import(src[i].fields[j]);
            }

            // map method
            for(let j in src[i].methods){
                db[i].methods[j] = new Core.Method();
                db[i].methods[j].import(src[i].methods[j]);
            }
        }
        else if(src[i].__type__==REF.MISSING){
            switch(src[i].__srcType__){
                case REF.METHOD: 
                    db[src[i].enclosingClass.id].methods[i] = new Core.Method();
                    db[src[i].enclosingClass.id].methods[i].import(src[i]);
                    break;
                case REF.FIELD:
                    db[src[i].enclosingClass.id].fields[i] = new Core.Field();
                    db[src[i].enclosingClass.id].fields[i].import(src[i]);
                    break;
                case REF.CLASS:
                    db[i] = new Core.Class();
                    db[i].import(src[i]);
                    break;
            }
        }
    }

    // re-map
    for(let i in db){

        // class properties
        if(db[i].enclosingClass !== null){
            db[i].enclosingClass = db[src[i].enclosingClass.id];
        }
        if(db[i].extends !== null){
            db[i].extends = db[src[i].extends.id];
        }
        if(db[i].innerClass !== null){
            db[i].enclosingClass = db[src[i].enclosingClass.id];
        }
        if(typeof db[i].innerClass == 'array'){
            db[i].innerClass = [];
            for(let j in src[i].innerClass){
                db[i].innerClass.push(db[src[i].innerClass[j].id]);
            }
        }
        if(typeof db[i].implements == 'array'){
            db[i].implements = [];
            for(let j in src[i].implements){
                db[i].implements.push(db[src[i].implements[j].id]);
            }
        }
        if(typeof db[i]._callers == 'array'){
            db[i]._callers = [];
            for(let j in src[i]._callers){
                db[i]._callers.push(db[src[i]._callers[j].id]);
            }
        }

        // method 
        // ['instr','enclosingClass','declaringClass','_useClass','_useMethod','_useField','_callers']                  
        for(let j in db[i].methods){

            // ins
            db[i].methods[j].instr = [];
            for(let k=0; k<src[j].instr.length; k++){
                bb = new Core.BasicBlock();
                bb.import(src[j].instr[k]);
                
                for(let l=0; l<bb.stack.length; l++){
                    // restore opcode
                    bb.stack[l].opcode = INSTR.findOpcode(bb.stack[l].opcode.id);
                    // restore right reference
                    if(bb.stack[l].right.$ !== undefined){

                        switch(bb.stack[l].right.__type__){
                            case STUB_TYPE.CLASS:
                                bb.stack[l].right = db[bb.stack[l].right.id];
                                break;
                            case STUB_TYPE.METHOD:
                                meth = db[bb.stack[l].right.id];
                                bb.stack[l].right = src[meth.enclosingClass.id].methods[meth.id];
                                break;
                            case STUB_TYPE.FIELD:
                                fied = db[bb.stack[l].right.id];
                                bb.stack[l].right = src[fied.enclosingClass.id].fields[fied.id];
                                break;
                            case STUB_TYPE.MISSING:
                                switch(bb.stack[l].right.__srcType__){
                                    case STUB_TYPE.CLASS:
                                        bb.stack[l].right = db[bb.stack[l].right.id];
                                        break;
                                    case STUB_TYPE.METHOD:
                                        meth = src[bb.stack[l].right.id];
                                        bb.stack[l].right = db[meth.enclosingClass.id].methods[meth.id];
                                        break;
                                    case STUB_TYPE.FIELD:
                                        field = src[bb.stack[l].right.id];
                                        bb.stack[l].right = db[field.enclosingClass.id].fields[field.id];
                                        break;
                                }
                                break;
                        }
                    }else{
                        
                    }
                }
                db[i].methods[j].instr.push(bb);
            }
        }

        // field
    }
    /*
    db[i].methods[j]._callers = {};
    for(let k in src[i].methods[j]._callers){
        callers = [];
        for(let l in src[i].methods[j]._callers[k]){
            callers.push()
        }
        db[i].methods[j]._callers[k] = callers;
    }
    */
    return db;
}


module.exports = {
    save: save,
    restore: restore
};