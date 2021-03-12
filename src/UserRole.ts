

export default class UserRole {

    __uuid:string ="";
    name:string = null;
    desc:string = "";
    acl:any[] =[];

    constructor(pConfig:any) {
        for(let i in pConfig)
            this[i] = pConfig[i];
    }

    getUUID():string {
        return this.__uuid;
    }

}