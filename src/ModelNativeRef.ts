


export enum ModelNativeRefType {
  CALL= 'CALL',
  CODE = 'CODE'
}

export class ModelNativeRef {
  addr:number = -1;
  at:number = -1;
  __t:ModelNativeRefType = null;

  constructor(pConfig:any = null){

    if(pConfig!==undefined)
      for(let i in pConfig)
        this[i]=pConfig[i];

  }
}
