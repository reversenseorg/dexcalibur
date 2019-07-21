

class IntentCriteria
{
    constructor(config=null){
        this.name = null;

        // auto config
        if(config != null){
            for(let i in config)
                this[i] = config[i];
        }
    }

    getName(){
        return this.name;
    }
}

class IntentFilter
{
    constructor(config){
        this.actions = [];
        this.categories = [];
        this.data = [];

        // auto config
        if(config != null){
            for(let i in config)
                    this[i] = config[i];
        }
    }

}

class Activity
{
    constructor(config=null){
        // the manifest data are stored here
        this.label = null;
        this.name = null;
        this.intent = null;
        this.metadata = null;
        this.attr = null;

        // this field contains the associated class
        this.ref = null;

        // auto config
        if(config != null){
            for(let i in config)
                if(this[i] !==  undefined)
                    this[i] = config[i];
        }
    }

    setAttributes(attr){
        this.attr = attr;
    }

    getAttributes(){
        return this.attr;
    }

    getLabel(){
        return this.label
    }

    getName(){
        return this.name;
    }

    isExported(){
        return (this.attr.exported != null) && (this.attr.exported === true);
    }
}

module.exports = {
    Activity: Activity,
    IntentFilter: IntentFilter,
    IntentCriteria: IntentCriteria
};