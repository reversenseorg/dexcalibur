
export default class TagCategory
{
    name:string = null;
    taglist:string[] = [];

    constructor(name:string, taglist:string[]){
        this.name = name;
        this.taglist = taglist;
    }

    addTag(tag:string){
        if(this.taglist.indexOf(tag)==-1)
            this.taglist.push(tag);
    }

    getTags():string[]{
        return this.taglist;
    }

    toJsonObject():any{
        let o:any = new Object();
        o.name = this.name;
        o.taglist = this.taglist;
        return o;
    }
}