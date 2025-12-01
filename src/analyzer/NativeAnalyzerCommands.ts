

export class NativeAnalyzerCommands {
    static FUNC_CMD = {
        DISASS: 'f_disass',
        DECOMPILE: 'f_dec',
        XREF: 'f_xref'
    };

    static FILE_CMD = {
        EXTRACT_SECTIONS: 'e_sections',
        EXTRACT_SYM: 'e_sym',
    };

    static from(pList:any, pCommands:string):string[] {
        const c = [];
        pCommands.split(':').map( vCmd => {
            c. push(pList[vCmd]);
        });
        return
    }

    static getFuncCmd(pCommands:string):string[] {
        return NativeAnalyzerCommands.from(NativeAnalyzerCommands.FUNC_CMD, pCommands);
    }

    static getFileCmd(pCommands:string):string[] {
        return NativeAnalyzerCommands.from(NativeAnalyzerCommands.FILE_CMD, pCommands);
    }
}