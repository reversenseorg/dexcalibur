module.exports = {
    table: function(header,array){
        let out = "|", sep= "|";
        for(let i in header){
            out += header[i]+"|";
            sep += "--|";   
        }
        out += "\n"+sep+"\n";   
        for(let j in array){
            out += "|"
            for(let i in header){
                if(array[j][header[i]] != null){
                    out += array[j][header[i]]+"|";
                }else{
                    out += "null|";
                }
            }
            out += "\n";
        } 
        return out;
    },
    code: function(txt){
        return "```\n"+txt+"\n```\n";
    },
    paragraph: function(txt){
        return "\n"+txt+"\n";
    },
    title2: function(txt){
        return "## "+txt+"\n";
    }
}