import {SearchToken} from "./SearchToken.js";
import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {Tag} from "@dexcalibur/dexcalibur-orm";

export class SearchPattern
{
  fn:any = null;
  pattern:string|null = null;
  field: SearchToken[] = []; //string|string[] = null;
  isModifier:boolean = false;
  isStructField:boolean = false;
  isDeepSearch:boolean = false;
  hasTag:boolean = false;
  tag:Nullable<Tag> = null;

  constructor(pConfig:any=null){
    if(pConfig!==undefined)
      for(let i in pConfig)
        (this as IStringIndex<any>)[i] = pConfig[i];


    //console.log("SEARCH PATTERN : ",this);
  }

  serialize():any{
    let o:any = new Object();
    o.isModifier = this.isModifier;
    o.isStructField = this.isStructField;
    o.isDeepSearch = this.isDeepSearch;
    o.field = this.field;
    o.pattern = this.pattern;
    o.tag = this.tag!=null ? this.tag.toJsonObject() : null;

    return o;
  }

}
