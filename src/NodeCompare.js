class NodeCompare
{
    constructor(original_node=null,new_node=null,diff=null){
        this.originalnode = original_node;
        this.diff = diff;
        this.newnode = new_node;    
        this.e = (diff===null);
    }

    getDiffFromOriginal(){
        return this.originalnode;
    }

    getDiffFromNew(){
        return this.newnode;
    }

    getDiff(){
        return this.diff;
    }

    isIdentic(){
        return this.e;
    }
}

module.exports = NodeCompare;