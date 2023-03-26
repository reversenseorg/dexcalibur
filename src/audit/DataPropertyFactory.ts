
import DataProperty from "./common/DataProperty.js";
import DexcaliburProject from "../DexcaliburProject.js";

export enum MetaSecurityProperty {
    AUTHENTICITY="authenticity",
    INTEGRITY="integrity",
    NON_REP="non-repudiability",
    CONFIDENTIALITY="confidentiality",
    AVAILABITY="availability",
    AUTHORIZATION="authorization",
}

export interface DataPropertyMap {
    [uid:string] :DataProperty
}

export default class DataPropertyFactory {

    ctx:DexcaliburProject;
    preset:DataPropertyMap = {};

    constructor(pContext:DexcaliburProject) {
        this.ctx = pContext;

        this._initPresetProperties();
    }

    /**
     * To init preset data properties
     *
     * @private
     */
    private _initPresetProperties(){
        const ppt = Object.keys(MetaSecurityProperty);
        const tag = this.ctx.getTagManager().getTag('audit.type.security');

        ppt.map( p => {
            this.preset[p] = new DataProperty({ name:MetaSecurityProperty[p], tag:[tag.getUUID()] })
        });
    }



}