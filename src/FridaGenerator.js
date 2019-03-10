const fs = require("fs");
const CLS = require("./CoreClass.js");


function makeTree(tree, fqcn, fqcn_suffix){
    let p=null;
    let o=fqcn_suffix.indexOf(".");
    if(o==-1){
        tree[fqcn_suffix] = fqcn;
    }else{
        p=fqcn_suffix.substr(0,o);
        if(tree[p]==null) tree[p]={};
        makeTree(tree[p], fqcn, fqcn_suffix.substr(o+1));
    }
}


function tree2str(tree){
    let p="{\n", z=tree;
    for(let i in z){
        p += i+": ";
        if(typeof z[i] == "object")
           p += tree2str(z[i])
        else
           p += " Java.use('"+z[i]+"'),\n";  
    }
    return p+`},\n
    `;
}

function FridaGenerator(ctx){
    this.context = ctx;
    this.script = "";
    this.tree = {};

    return this;
}
FridaGenerator.prototype.class = function(res){
    let data = "var CLS={"
    let tree = {};
    res.foreach((obj)=>{
        if(obj instanceof CLS.Class){
            makeTree(tree, obj.fqcn, obj.fqcn);
            //tree = updateTree(tree, obj.fqcn, 'Java.use("'+obj.fqcn+'")');
        }
    });
    this.script = "var CLS="+tree2str(tree)+";";
    return this;
}
FridaGenerator.prototype.save = function(path){
    //console.log(this.script);
    fs.writeFileSync(path, this.script);
    return this;
}

module.exports = FridaGenerator;