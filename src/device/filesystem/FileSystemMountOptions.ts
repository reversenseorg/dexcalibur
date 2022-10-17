/**
 *
 *
 * @class
 * @since 1.1.0
 */
export class FileSystemMountOptions {

    constructor(pConfig:any[]) {
        if(pConfig!=null){
            pConfig.map( (v)=>{
                if(typeof (v)==='string'){
                    this[v] = true;
                }else{
                    this[v.ppt] = v.val;
                }
            });
        }
    }
}