import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";

export enum GuiErrCategoryCode {
    TYPE_MGR = 100
}

export class GuiAnalyzerException extends MonitoredError {

    static ERR = {
        EXISTING_EVT_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 1,
        EXISTING_CMP_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 2,
        EXISTING_ROLE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 3,
        UNKNOWN_EVT_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 4,
        UNKNOWN_CMP_TYPE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 5,
        UNKNOWN_ROLE: ErrorCode.ANALYZER_GUI + GuiErrCategoryCode.TYPE_MGR + 6,
    };

    static EXISTING_EVT_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The event type [uid=${pUID}] already exists.`,GuiAnalyzerException.ERR.EXISTING_EVT_TYPE) };
    static EXISTING_CMP_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The component type [uid=${pUID}] already exists.`,GuiAnalyzerException.ERR.EXISTING_EVT_TYPE) };
    static EXISTING_ROLE = (pUID:string)=>{ return new GuiAnalyzerException(` The role [uid=${pUID}] already exists.`,GuiAnalyzerException.ERR.EXISTING_EVT_TYPE) };
    static UNKNOWN_EVT_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The event type [uid=${pUID}] not exists.`,GuiAnalyzerException.ERR.UNKNOWN_EVT_TYPE) };
    static UNKNOWN_CMP_TYPE = (pUID:string)=>{ return new GuiAnalyzerException(` The component type [uid=${pUID}] not exists.`,GuiAnalyzerException.ERR.UNKNOWN_CMP_TYPE) };
    static UNKNOWN_ROLE = (pUID:string)=>{ return new GuiAnalyzerException(` The role [uid=${pUID}] not exists.`,GuiAnalyzerException.ERR.UNKNOWN_ROLE) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GUI IR MANAGER', pMsg, pCode, pExtra);
    }
}