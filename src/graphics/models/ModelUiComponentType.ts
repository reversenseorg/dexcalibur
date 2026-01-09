import {Savable, STUB_TYPE} from "../../ModelSavable.js";
import {DbDataType, DbKeyType, NodeProperty, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelInstruction from "../../ModelInstruction.js";
import ModelMethod from "../../ModelMethod.js";
import ModelUiRole from "./ModelUiRole.js";
import {Nullable} from "../../core/IStringIndex.js";
import ModelUiEventType from "./ModelUiEventType.js";


export interface UiComponentTypeOpts {
    _uid?:string,
    painted?:boolean,
    version?:string;
    description?:string,
    role?:Nullable<ModelUiRole>,
    relatedRoles?:ModelUiRole[],
    specialize?: Nullable<ModelUiComponentType>,
    children?: ModelUiComponentType[],
    fire?:ModelUiEventType[]
    statesCount?:number;
}
/**
 *
 */
export default class ModelUiComponentType extends Savable
{

    static TYPE:NodeType = (new NodeType( "ui_cmp_type", NodeInternalType.UI_CMP_TYPE, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("version"))
            .type(DbDataType.STRING).def(null),
        (new NodeProperty("orientation"))
            .type(DbDataType.STRING)
            .schema({ type:"string" })
            .descr("Orientation of component : vertical, horizontal")
            .def(null),
        (new NodeProperty("description")).type(DbDataType.STRING).def(null),
        (new NodeProperty("role"))
            .single(ModelUiRole.TYPE)
            .def(null),
        (new NodeProperty("relatedRoles"))
            .multiple(ModelUiRole.TYPE)
            .def([]),
        (new NodeProperty("fire")).multiple(ModelUiEventType.TYPE).def([]),
    ]))
        .descr(`Represent the type of an UI component such as Button, TextView, ImageView, etc.`)
        .dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.UI_CMP_TYPE;

    version:string = "1.0.0";
    painted:boolean = false;
    orientation:Nullable<string> = null;
    description:string = "";
    role:Nullable<ModelUiRole> = null;
    relatedRoles:ModelUiRole[] = [];
    specialize: Nullable<ModelUiComponentType> = null;
    children: ModelUiComponentType[] = [];
    fire:ModelUiEventType[] = [];
    statesCount:number = -1;

    constructor(pConfig:Nullable<UiComponentTypeOpts>=null){
        super(STUB_TYPE.UI_CMP_TYPE);

        if(pConfig != null){
            for(let i in pConfig)
                this[i] = pConfig[i];
        }
    }

    isAtomic():boolean {
        return (this.children.length == 0);
    }

    isLayout():boolean {
         return (this.painted==false);
    }

    getRole():Nullable<ModelUiRole> {
        return this.role;
    }

    getRelatedRoles():ModelUiRole[] {
        return this.relatedRoles;
    }
}
ModelUiComponentType.TYPE.builder(ModelUiComponentType);


ModelUiComponentType.TYPE.updateProperties([
    (new NodeProperty("specialize")).single(ModelUiComponentType.TYPE).def(null),
    (new NodeProperty("children")).multiple(ModelUiComponentType.TYPE).def([]),
])