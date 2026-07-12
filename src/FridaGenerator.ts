/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import *  as fs from "fs";
import ModelClass from "./ModelClass.js";


function makeTree(tree:any, fqcn:string, fqcn_suffix:string){
    let p:string=null;
    let o:number=fqcn_suffix.indexOf(".");
    if(o==-1){
        tree[fqcn_suffix] = fqcn;
    }else{
        p=fqcn_suffix.substr(0,o);
        if(tree[p]==null) tree[p]={};
        makeTree(tree[p], fqcn, fqcn_suffix.substr(o+1));
    }
}


function tree2str(tree:any):string{
    let p:string="{\n", z:any=tree;
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

export default  class FridaGenerator
{
    script:string;
    tree:any;

    constructor(){
        this.script = "";
        this.tree = {};

        return this;
    }

    class(res:any):FridaGenerator{
        let tree:any = {};
        res.foreach((obj:ModelClass)=>{
            if(obj instanceof ModelClass){
                makeTree(tree, obj.name, obj.name);
                //tree = updateTree(tree, obj.fqcn, 'Java.use("'+obj.fqcn+'")');
            }
        });
        this.script = "var CLS="+tree2str(tree)+";";
        return this;
    }

    save(path:string):FridaGenerator{
        fs.writeFileSync(path, this.script);
        return this;
    }

}
