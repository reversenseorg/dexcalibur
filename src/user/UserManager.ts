/*
import * as _fs_ from "fs";

import {User} from "./User";
import DexcaliburEngine from "./DexcaliburEngine";



enum EXEC_MODE {
    ELECTRON,
    NODE
}
const MODE = EXEC_MODE.ELECTRON;

export class UserManager {

    db_name = "um";

    context: DexcaliburEngine = null;

    users: User[] = [];


    constructor(pEngine:DexcaliburEngine) {
        this.context = pEngine;
    }

    load():void {
        let d:any;
        try{
            d = JSON.parse(_fs_.readFileSync(
                this.context.getWorkspace().getConfigFolderLocation()
            ).toString());

            d.users.map( (vUser:User) => {
                // check if user not in the list
                this.users.push(User.fromJsonObject(vUser)) ;
            });
        }catch(err){
            Logger.error("UserManager cannot be loaded. Cause :"+err.message);
            throw new Error("UserManager cannot be loaded");
        }
    }

    save():void {
        let p:string ;
        let data:any = {
            users: []
        };

        try{
            this.users.map( (vUser:User) => {
               data.users.push(vUser.toJsonobject()) ;
            });
            p = this.context.getWorkspace().getConfigFolderLocation();
            _fs_.writeFileSync(
                p,
                JSON.stringify(data),
                { flag:'w+', mode:'0o666'});
        }catch(err){
            Logger.error("UserManager cannot be saved. Cause :"+err.message);
            throw new Error("UserManager cannot be saved");
        }
    }


    isValidState(pUser:User):boolean {
        return true;
    }

    createUser(pUser:User): boolean {
        this.users.push(pUser);
        // this operatrion must trigger DB backup
        this.save();

        return true;
    }
}
*/