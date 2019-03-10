const fs = require("fs");

const MD = require("./Markdown.js");

const FORMAT = {
    code: 0x1,
    list: 0x2
}

function RuleResult(config){
    this.description = null;
    this.verdict = null;
    this.format = null;
    this.data = null;
    this.match = false;
    this.header = null;

    for(let i in config) this[i]=config[i];

    return this;
}
RuleResult.prototype.toMarkdown = function(){
    let out ="";
    if(this.description !== null) out += "\n"+this.description+"\n";

    switch(this.format){
        case FORMAT.code:
            out += MD.code(this.data);
            break;
        case FORMAT.list:
            out += MD.table(this.header,this.data.getData());
            break;     
        case FORMAT.raw:
            out += this.data;
            break;     
    }

    if(this.verdict !== null){
        out += "#### Verdict \n"+this.verdict+"\n";
    }
    
    return out;
}

/**
 * Represente le couple regle/resultat
 * @param {*} config 
 */
function Match(config){
    this.result = null;
    this.rule = null;

    for(let i in config) this[i]=config[i];

    return this;
}
Match.prototype.toMarkdown = function(){
    let out="";
    out += "## "+this.rule.name+"\n"+this.rule.description+"\n";
    if(this.result !== null)
        out += this.result.toMarkdown();
    else
        out += "Not match founds";

    return out;
 }

/**
 * Represente une regle
 * @param {*} config 
 */
function Rule(config){
    this.enable = true;
    this.name = null;
    this.description = null;
    this.ruleset = null;
    this.pattern = null;
    this.header = null;
    this.type = null;

    for(let i in config) this[i]=config[i];

    return this;
}
Rule.prototype.run = function(context){
    if(this.pattern instanceof Function){
        return new Match({
            result: this.pattern(context),
            rule: this
        });
    }else{
        return null;
    }
}


/**
 * Un scanner regroupe un ensemble de regles regroupees en categories
 * et faisant partageant un meme objectif (identifier la surface d'attaque, 
 * les mechanismes, ..)
 * @param {*} config 
 */
function Scanner(config){
    this.name = null;
    this.context = null
    this.description = null;
    this.analyzer = null;
    this.rules = {};
    this.matches = [];

    for(let i in config) this[i]=config[i];

    return this;
}
Scanner.prototype.addRule = function(category,rule){
    if(this.rules[category]==null){
        this.rules[category] = {};
    }
    this.rules[category][rule.name] = rule;
};
Scanner.prototype.scan = function(force){
    let match = null;
    for(let cat in this.rules){
        for(let name in this.rules[cat]){
            if((this.rules[cat][name] instanceof Rule) 
                && this.rules[cat][name].enable){
                
                match = this.rules[cat][name].run(this.context);

                if(this.rules[cat][name].hasMatch(match)){
                    this.matches.push(match);
                }
            }
        }
    }
};
Scanner.prototype.publish = function(path){
    let filepath = path;

    if(filepath == null)
        filepath=this.context.workspace.getTimestampedFilePath(this.name+"_report",".md");
    
    let fd = fs.openSync(filepath,'w+');
    for(let i in this.matches){
        fs.writeSync(fd, this.matches[i].toMarkdown());
    }
    fs.closeSync(fd);
    return filepath;
};


module.exports = {
    FORMAT: FORMAT,
    RuleResult: RuleResult,
    Scanner: Scanner,
    Rule: Rule,
    Match: Match
}