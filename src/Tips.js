/**
 * @deprecated
 */
module.exports = {
    /**
     * To print a "How to do new analysis ?" tip in the console
     * @global
     * @function
     * @namespace Tips
     */
    postAnalyze: function(){
       return "\n"
       +"╔═══════════════════════════[ TIPS ]═══════════════════════════════╗\n"
       +"║ Too long ?                                                       ║\n"
       +"║ Save it into the database                                        ║\n"
       +"║ > save.db('127.0.0.1','27035'[,'user','pwd'])                    ║\n"
       +"║                                                                  ║\n"
       +"║ Or into a JSON file                                              ║\n"
       +"║ > save.file('save.json')                                         ║\n"
       +"║                                                                  ║\n"
       +"║ Read save.help() ! =)                                            ║\n"
       +"╚══════════════════════════════════════════════════════════════════╝\n" ; 
    },
    /**
     * To print a "How to create a new project ?" tip in the console
     * @global
     * @function
     * @namespace Tips
     */
    postNewProject: function(){
        return "\n"
        +"╔═══════════════════════════[ TIPS ]═══════════════════════════════╗\n"
        +"║ Start from the database :                                        ║\n"
        +"║ > restore.db('127.0.0.1','27035'[,'user','pwd'])                 ║\n"
        +"║                                                                  ║\n"
        +"║ Start from a file :                                              ║\n"
        +"║ > restore.file('backup.json')                                    ║\n"
        +"║                                                                  ║\n"
        +"║ Read restore.help() ! =)                                         ║\n"
        +"╚══════════════════════════════════════════════════════════════════╝\n" ; 
     }  
};