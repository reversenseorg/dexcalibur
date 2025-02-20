import ModelMethod from "./ModelMethod.js";
import ModelField from "./ModelField.js";
import ModelPackage from "./ModelPackage.js";
import ModelClass from "./ModelClass.js";
import KeyPoint from "./hook/KeyPoint.js";
import {BookmarkType} from "./bookmark/BookmarkType.js";
import {Bookmark} from "./bookmark/Bookmark.js";
import JavaMethodHook from "./hook/JavaMethodHook.js";
import NativeFunctionHook from "./hook/NativeFunctionHook.js";
import HookTemplateFragment from "./hook/HookTemplateFragment.js";
import HookStrategy from "./hook/HookStrategy.js";
import HookSet from "./HookSet.js";
import {UserSession} from "./user/session/UserSession.js";
import {SessionData} from "./user/session/SessionData.js";
import {UserAccount, UserAccountType} from "./user/UserAccount.js";
import AccessControl from "./user/acl/AccessControl.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import DexcaliburProject from "./DexcaliburProject.js";
import HookStrategySelector from "./hook/HookStrategySelector.js";
import {ModelFunction} from "./ModelFunction.js";


import SystemCallHook from "./hook/SystemCallHook.js";
import {IStringIndex, Nullable} from "./core/IStringIndex.js";
import {Brand} from "./Brand.js";
import {DeviceModel} from "./DeviceModel.js";
import {
    DataSourceHelper,
    NodePropertyState,
    NodeProperty,
    DbDataType,
    DbKeyType,
    DbSerialize, DataSource, NodeType, TagCategory, Tag, AppContextType
} from "@dexcalibur/dexcalibur-orm";
import InMemoryConnector from "../connectors/inmemory/adapter.js";
import {MongodbAdapter, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {CustomCode} from "./actionnable/CustomCode.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import Inspector, {INSPECTOR_TYPE} from "./Inspector.js";
import AssuranceReport, {Match} from "./audit/common/AssuranceReport.js";
import AssuranceModel from "./audit/common/AssuranceModel.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelInstruction from "./ModelInstruction.js";
import HookPrologue from "./HookPrologue.js";
import {HookVariableArray, HookVariableObject} from "./HookVariable.js";
import {HookVariableMap} from "./hook/common.js";
import {Person} from "./user/Person.js";
import {OrganizationUnitUUID} from "./organization/OrganizationUnit.js";
import {Cookie} from "./user/session/Cookie.js";




/*
static MEM:DataSource = (new DataSource(InMemoryConnector.UUID,{
  single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
    Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
    const o = pContext.getSearchEngine().get[pNodeType.getSourceAlias()](pUID);
    Logger.debug("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
    return o;
  }
}));

/*
static REDIS:DataSource = new DataSource("redis",{
  single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
    Logger.debug("DATA SOURCE [REDIS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
    const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
    Logger.debug("DATA SOURCE [REDIS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
    return o;
  }
});

static ELASTIC:DataSource = new DataSource(ElasticConnector.UUID,{
  single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
    Logger.debug("DATA SOURCE [ELASTIC]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
    const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
    Logger.debug("DATA SOURCE [ELASTIC]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
    return o;
  }
});
*/
DataSourceHelper.addSource("MEM", (new DataSource(InMemoryConnector.UUID,{
    single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
        //console.log("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
        const o = pContext.getSearchEngine().get[pNodeType.getSourceAlias()](pUID);
        //console.log("DATA SOURCE [MEM]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
        return o;
    }
})));
DataSourceHelper.addSource("FILE", new DataSource("fs",{
    single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
        //console.log("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
        const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
        //console.log("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
        return o;
    }
}));
DataSourceHelper.addAsyncSource("PROJECT_DB", new DataSource("PROJECT_DB", {
    single: async function(pContext:any, pNodeType:NodeType, pUID:any):Promise<any>{

        const filter:any = {};
        const pk  = pNodeType.getPrimaryKey();

        if(pk.getName()!="_uid"){
            filter[pk.getName()] = pUID;
        }else{
            filter._uid = pUID;
        }

        return await ((pContext as DexcaliburProject)
                .getProjectDB()
                .getCollectionOf(pNodeType.getType()) as MongodbDbCollection)
                .asyncGetEntry(filter);
    }
}));
DataSourceHelper.addAsyncSource("ENGINE_DB", new DataSource("ENGINE_DB",{
    single: async function(pContext:any, pNodeType:NodeType, pUID:any):Promise<any>{

        if(pContext._type===AppContextType.WEB_SERVER){
            return await ((pContext as DexcaliburEngine)
                .getEngineDB()
                .getCollectionOf(pNodeType.getType()) as MongodbDbCollection)
                .asyncGetEntry({ _uid: pUID});
        }else{
            return await ((pContext as DexcaliburProject)
                .getContext()
                .getEngineDB()
                .getCollectionOf(pNodeType.getType()) as MongodbDbCollection)
                .asyncGetEntry({ _uid: pUID});
        }
    }
}));
DataSourceHelper.addAsyncSource("SIGNATURE_DB", new DataSource("SIGNATURE_DB",{
    single: async function(pContext:any, pNodeType:NodeType, pUID:any):Promise<any>{

        const filter:any = {};
        const pk  = pNodeType.getPrimaryKey();

        if(pk.getName()!="_uid"){
            filter[pk.getName()] = pUID;
        }else{
            filter._uid = pUID;
        }


        if(pContext._type===AppContextType.WEB_SERVER){
            switch (pNodeType.getType()){
                case NodeInternalType.ASSURANCE_MODEL:
                    return await ((pContext as DexcaliburEngine)
                        .getAuditManager()
                        .getModelByUID(
                            (pContext as DexcaliburEngine).getInternalAcc(),
                            pUID
                        ))
                    break;
                default:
                    throw new Error("Operation not supported");
            }
            /*return await ((pContext as DexcaliburEngine)
                .getEngineDB()
                .getCollectionOf(pNodeType.getType()) as MongodbDbCollection)
                .asyncGetEntry({ _uid: pUID});

            throw new Error("Operation not supported");*/

            return await ((pContext as DexcaliburEngine)
                .getSignatureServer()
                .find(pNodeType.getType(),  filter));
        }else{
            return await ((pContext as DexcaliburProject)
                .getContext()
                .getSignatureServer()
                .find(pNodeType.getType(),  filter));
        }
    }
}));



/*
static FILE:DataSource = new DataSource("fs",{
  single: function(pContext:any, pNodeType:NodeType, pUID:any):any{
    Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" ...");
    const o = pContext.getDB().getCollection(pNodeType.getSourceAlias(),pNodeType).getEntry(pUID);
    Logger.debug("DATA SOURCE [FS]> GET > "+pNodeType.getSourceAlias()+" : "+pUID+" : "+(o!=null ? o.getUID() : 'NULL'));
    return o;
  }
});*/

UserAccount.TYPE.updateProperties([
    (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty('_time')).type(DbDataType.STRING),
    (new NodeProperty('_username')).type(DbDataType.STRING).notnull().unique(),
    (new NodeProperty('_password')).type(DbDataType.STRING).notnull(),
    (new NodeProperty('_salt')).type(DbDataType.STRING).notnull(),
    (new NodeProperty('_locked')).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty('_padding')).type(DbDataType.STRING).notnull(),
    (new NodeProperty('_roles')).type(DbDataType.STRING).def([]),
    (new NodeProperty('_tokens')).type(DbDataType.STRING).def([]),
    (new NodeProperty('_type')).type(DbDataType.STRING).def(UserAccountType.LOCAL),
    (new NodeProperty('_orgs')).type(DbDataType.BLOB).def([]),
    (new NodeProperty('_extra')).type(DbDataType.BLOB).def({}).addValidationRule(UserAccount.VALIDATE._extra as any),
    (new NodeProperty('_authorized_ips')).type(DbDataType.STRING).def([]),
    (new NodeProperty('_person')).type(DbDataType.BLOB)
        .sleep( (x:NodePropertyState) => {
            return (x.p !=null ? x.p : null) ;
        } )
        .wakeUp( (x:NodePropertyState) => {
            return (x.p!=null ? new Person(x.p)  : null)
        }),
]).dataSource("ENGINE_DB").builder(UserAccount);

UserSession.TYPE.updateProperties([
    // (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),

    (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty('_acc')).single(UserAccount.TYPE).notnull(),
    (new NodeProperty('_created')).type(DbDataType.INTEGER),
    (new NodeProperty('_destroyed')).type(DbDataType.INTEGER),
    (new NodeProperty('savedHash')).type(DbDataType.STRING).def(null),
    (new NodeProperty('_project')).volatile().type(DbDataType.STRING).serialize(DbSerialize.JSON),
    (new NodeProperty('trustProxy')).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty('passport')).type(DbDataType.BLOB).def({}),
    (new NodeProperty('cookie'))
        .type(DbDataType.BLOB)
        .sleep( (x:NodePropertyState)=>{
            if(x.p !=null){
                return (x.p as Cookie).toJSON()
            }
            return null;
        })
        .wakeUp( (x:NodePropertyState) =>  {
            if(x.p !=null){
                return new Cookie(x.p);
            }
            return null;
        }).def(null),
    (new NodeProperty('_data'))
        .type(DbDataType.BLOB)
        .sleep( (x:NodePropertyState)=>{
            const raw:Record<string, any> = {};
            if(x.p !=null){
                for(let k in x.p){
                    if(x.p[k] != null){
                        // session_data object
                        raw[k] = x.p[k].toJsonObject();
                    }
                }
            }
            return raw;
        })
        .wakeUp( (x:NodePropertyState) =>  {
            const raw:Record<string, any> = {};
            if(x.p !=null){
                for(let k in x.p){
                    if(x.p[k] != null){
                        // session_data object

                        raw[k] = new SessionData({
                            _name: k,
                            _value: x.p[k]._value,
                            _sess: x.self
                        });
                    }
                }
            }
            return raw;
        }),
    (new NodeProperty('_defaultProject')).type(DbDataType.STRING)
        .sleep( (x:NodePropertyState)=>{ return (x.p!=null? x.p.getUID() : null)})
        .wakeUp( (x:NodePropertyState) =>  { return (x.p!=null ? (x.ctx as DexcaliburEngine).getProject(x.p) : null)}),

    (new NodeProperty('_conn')).type(DbDataType.STRING)
        .sleep( (x:NodePropertyState)=>{ return null; })
        .wakeUp( (x:NodePropertyState) =>  { return x.p })
]).dataSource("ENGINE_DB").builder(UserSession);


SessionData.TYPE.updateProperties([
    (new NodeProperty('_sess')).volatile().single(UserSession.TYPE),
    /*
    UserSession.TYPE.asForeignKey(DbKeyType.PRIMARY, 0),
    (new NodeProperty('_name')).type(DbDataType.STRING).key(DbKeyType.PRIMARY, 1),
    (new NodeProperty('_value'))
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            let c:any = x.p;
            switch(x.self._name){
                case 'prj_active':
                    c = (x.p as DexcaliburProject).getUID();
                    break;

            }
            return c;
        })
        .wakeUp( (x:NodePropertyState) => {
            let c:any = x.p;
            switch(x.self._name){
                case 'prj_active':
                    c = x.ctx.getProject(x.p);
                    break;
            }
            return c;
        })*/
]);
/*
UserSession.TYPE.updateProperties([
    (new NodeProperty('_data')).multiple(SessionData.TYPE)
]);*/

ModelInstruction.TYPE.updateProperties([
    (new NodeProperty("offset")).type(DbDataType.NUMERIC).key(DbKeyType.PRIMARY), // path relative to scope root
  //  (new NodeProperty("_parent")).volatile(), //.single(ModelMethod.TYPE),
    (new NodeProperty("iline")).type(DbDataType.NUMERIC).def(-1),
    (new NodeProperty("_raw")).type(DbDataType.STRING),
    (new NodeProperty("_call")).volatile().type(DbDataType.STRING),
    (new NodeProperty("left")).type(DbDataType.BLOB).def(false),
    (new NodeProperty("right")).type(DbDataType.BLOB).def(null),
    (new NodeProperty("opcode")).type(DbDataType.BLOB).def([]),
    (new NodeProperty("tags")).type(DbDataType.BLOB).def([]),
    (new NodeProperty("value")).type(DbDataType.BLOB).def(null),
]);


ModelBasicBlock.TYPE.updateProperties([

    (new NodeProperty("offset")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
    (new NodeProperty("_parent")).volatile().single(ModelMethod.TYPE),
    (new NodeProperty("line")).type(DbDataType.NUMERIC).def(-1),
    (new NodeProperty("prologue")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("stack")).volatile().multiple(ModelInstruction.TYPE).embed(),
    (new NodeProperty("tags")).type(DbDataType.BLOB).def([]),

    (new NodeProperty("cond_name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("goto_name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("catch_name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("try_name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("try_end_name")).type(DbDataType.STRING).def(null),

    (new NodeProperty("switch_case")).volatile().type(DbDataType.BLOB),
    (new NodeProperty("switch_statement")).volatile().type(DbDataType.BLOB),

    (new NodeProperty("linked_try_block")).volatile().type(DbDataType.STRING),
    (new NodeProperty("linked_catch_block")).volatile().type(DbDataType.STRING),

    (new NodeProperty("duplicate")).volatile().type(DbDataType.BLOB).def(null),
    (new NodeProperty("switch")).volatile().type(DbDataType.BLOB).def(null),
    (new NodeProperty("array_data_name")).type(DbDataType.BLOB),
    (new NodeProperty("array_data")).type(DbDataType.BLOB),
    (new NodeProperty("succ")).volatile().multiple(ModelBasicBlock.TYPE).def([]),
    (new NodeProperty("pred")).volatile().multiple(ModelBasicBlock.TYPE).def([]),
    (new NodeProperty("catch")).volatile().type(DbDataType.BLOB).def(null),
    (new NodeProperty("visited")).type(DbDataType.BOOLEAN).def(false)

]).dataSource("MEM");


ModelMethod.TYPE.updateProperties([
        (new NodeProperty("__signature__")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        (new NodeProperty("name")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("modifier")).volatile(),
        (new NodeProperty("tags"))
            .type(DbDataType.BLOB),
        (new NodeProperty("alias")).type(DbDataType.STRING),
        (new NodeProperty("args"))
            .type(DbDataType.STRING)
            .sleep((x:NodePropertyState) => {

                if(x.p==null) return [];
                const types:any[]=[];

                x.p.map((vArgType:ModelBasicType|ModelObjectType) => {
                    types.push(vArgType.toJsonObject());
                });

                return types;
            })
            .wakeUp( x => {
                if(x==null)  return [];

                const types:any[]=[];
                x.p.map((vArgType:ModelBasicType|ModelObjectType) => {
                    if(vArgType.__==NodeInternalType.OBJECT_TYPE){
                        types.push(new ModelObjectType(vArgType.name, vArgType.arr));
                    }else{
                        types.push(new ModelBasicType(vArgType._hashcode, vArgType.arr));
                    }
                });

                return types;
            })
            .def([]),
    ,
        (new NodeProperty("ret"))
            .type(DbDataType.STRING)
            .sleep((x:NodePropertyState) => {
                if(x.p==null) return null;
                return x.p.toJsonObject();
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null)  return null;

                if(x.p.__==NodeInternalType.OBJECT_TYPE){
                    return new ModelObjectType(x.p.name, x.p.arr);
                }else{
                    return new ModelBasicType(x.p._hashcode, x.p.arr);
                }
            })
            .def(null),
        (new NodeProperty("instr"))
            .multiple(ModelBasicBlock.TYPE)
            .embed(), //.volatile(), //.multiple(ModelBasicBlock.TYPE),
        (new NodeProperty("datas")).volatile(),
        (new NodeProperty("switches")).volatile(),
        (new NodeProperty("probing")).type(DbDataType.BOOLEAN).def(false),

        (new NodeProperty("locals")).type(DbDataType.INTEGER).def(0),
        (new NodeProperty("registers")).type(DbDataType.INTEGER).def(0),
        (new NodeProperty("params")).volatile(),

        (new NodeProperty("enclosingClass")).single(ModelClass.TYPE),
        (new NodeProperty("declaringClass")).single(ModelClass.TYPE),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING).serialize(DbSerialize.JSON).def([]),
    ]).dataSource("MEM").builder(ModelMethod);


ModelField.TYPE.updateProperties([
        (new NodeProperty("__signature__")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        (new NodeProperty("fqcn")).type(DbDataType.STRING),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("alias")).type(DbDataType.STRING),
        (new NodeProperty("modifiers")).type(DbDataType.STRING),
        (new NodeProperty("type")).type(DbDataType.STRING),
        (new NodeProperty("enclosingClass")).single(ModelClass.TYPE),
        (new NodeProperty("declaringClass")).single(ModelClass.TYPE),
        (new NodeProperty("__aliasedSignature__")).volatile().type(DbDataType.STRING),
        (new NodeProperty("_hashcode")).type(DbDataType.STRING),
        (new NodeProperty("_isBinding")).type(DbDataType.BOOLEAN).def(false),
        (new NodeProperty("_callers")).multiple(ModelMethod.TYPE),
        (new NodeProperty("_getters")).multiple(ModelMethod.TYPE),
        (new NodeProperty("_setters")).multiple(ModelMethod.TYPE),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING)
    ]).dataSource("MEM").builder(ModelField);


ModelPackage.TYPE.updateProperties([
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            (new NodeProperty("sname")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("children")).volatile(),
            (new NodeProperty("tags")).type(DbDataType.STRING),
            (new NodeProperty("alias")).type(DbDataType.STRING),
    ]).dataSource("MEM").builder(ModelPackage);


ModelClass.TYPE.updateProperties([
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            (new NodeProperty("simpleName")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("alias")).type(DbDataType.STRING),
            (new NodeProperty("source")).type(DbDataType.STRING),
            (new NodeProperty("modifiers")).type(DbDataType.STRING),

            (new NodeProperty("package")).volatile().single(ModelPackage.TYPE),
            (new NodeProperty("implements")).multiple(ModelClass.TYPE),
            (new NodeProperty("extends")).single(ModelClass.TYPE),
            (new NodeProperty("supers")).multiple(ModelClass.TYPE),

            (new NodeProperty("innerClass")).type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty("enclosingClass")).single(ModelClass.TYPE),

            (new NodeProperty("annotations")).volatile(),
            (new NodeProperty("methods")).volatile().multiple(ModelMethod.TYPE),
            (new NodeProperty("fields")).volatile().multiple(ModelField.TYPE),
            (new NodeProperty("inherit")).volatile().multiple(ModelMethod.TYPE),
            (new NodeProperty("_methCount")).type(DbDataType.INTEGER),
            (new NodeProperty("_fieldCount")).type(DbDataType.INTEGER),
            (new NodeProperty("tags"))
                .type(DbDataType.STRING),

            (new NodeProperty("_callers")).volatile().multiple(ModelMethod.TYPE),
            (new NodeProperty("_hashcode")).type(DbDataType.STRING),
            (new NodeProperty("_isBinding")).type(DbDataType.BOOLEAN),
            (new NodeProperty("__pretty_signature__")).type(DbDataType.STRING),
            (new NodeProperty("__aliasedCallSignature__")).type(DbDataType.STRING),
            (new NodeProperty("__p"))
                .type(DbDataType.STRING)

    ]).dataSource("MEM").builder(ModelClass);


KeyPoint.TYPE.updateProperties([
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("token")).type(DbDataType.STRING).def(null),
        (new NodeProperty("description")).type(DbDataType.STRING).def(null),
        (new NodeProperty("code")).type(DbDataType.STRING).def(null),
        (new NodeProperty("generator"))
            .type(DbDataType.STRING)
            .sleep((x:NodePropertyState) => { return (x.p!=null ? x.p.toString() : null) })
            .wakeUp( x => { return null  }) // (x != null ? Function(x) : null)
            .def(null),
        (new NodeProperty("generatorCode"))
            .type(DbDataType.BLOB)
            .sleep(x => {
                if(x.p==null) return null;
                if(x.p.toJsonObject==null) return x.p;

                return x.p.toJsonObject();
            })
            .wakeUp( x => {
                if(x==null)  return null;
                if(x.p==null)  return null;

                return new CustomCode(x.p);
            }) // (x != null ? Function(x) : null)
            .def(null),
        (new NodeProperty("type")).type(DbDataType.NUMERIC),
        (new NodeProperty("weight")).type(DbDataType.NUMERIC),
        (new NodeProperty("enabled")).type(DbDataType.BOOLEAN),
        (new NodeProperty("deps"))
            .type(DbDataType.STRING),
            //.sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
            //.wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),
        (new NodeProperty("condition")).type(DbDataType.STRING),
        (new NodeProperty("parent")).volatile().single(KeyPoint.TYPE).def(null),
        (new NodeProperty("children")).volatile().multiple(KeyPoint.TYPE),
        (new NodeProperty("_c")).type(DbDataType.STRING).def(null),
        (new NodeProperty("node"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState) => {
                const o = [];
                for(const uid in x.p){
                    o.push({
                        __:x.p[uid].__,
                        uid: (x.p[uid].getUID != null ? x.p[uid].getUID() : x.p[uid].uid)
                    });
                }
                return o; //JSON.stringify(o);
            })
            .wakeUp( (x:NodePropertyState) => {
                const o = {};
                x.p.map( v => {
                    o[v.uid] = v;
                });
                return o;
            })
        ]).builder(KeyPoint).dataSource("PROJECT_DB");



BookmarkType.TYPE.updateProperties([
        (new NodeProperty("id")).type(DbDataType.NUMERIC).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING).unique(),
        (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
        (new NodeProperty("priority")).type(DbDataType.NUMERIC).def(null),
        (new NodeProperty("theme"))
            .type(DbDataType.BLOB),
            //.sleep( (x:NodePropertyState) => { return (x.p != null ? x.p : null )})
            //.wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )})
    ]).dataSource("PROJECT_DB").builder(BookmarkType);

Bookmark.TYPE.updateProperties([
    (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
    (new NodeProperty("category")).type(DbDataType.STRING).def(null),
    (new NodeProperty("type")).single(BookmarkType.TYPE)
]).dataSource("PROJECT_DB").builder(Bookmark);


HookSet.TYPE.updateProperties([
    (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).unique(),
    (new NodeProperty("description")).type(DbDataType.STRING).def(null),
    (new NodeProperty("category")).type(DbDataType.STRING).def(null),
    (new NodeProperty("deprecated")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("removed")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("prologue"))
        .type(DbDataType.BLOB)
        .sleep( (x:NodePropertyState) => {
            if(x.p!=null){
                return x.p.toJsonObject();
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {
            if(x.p!=null){
                return new HookPrologue(x.p);
            }else{
                return null;
            }
        })
        .def(null),
    (new NodeProperty("context")).volatile(),
    (new NodeProperty("intercepts")).volatile(),
    (new NodeProperty("probe")).volatile(),
    (new NodeProperty("hooks")).volatile(),
    (new NodeProperty("color")).def(null)
        .type(DbDataType.BLOB),
        //.sleep( (x:NodePropertyState) => { return (x.p != null ? x.p : null )})
        //.wakeUp( (x:NodePropertyState) => { return (x.p != null ? x.p : null )}),
    (new NodeProperty("share")).def({})
        .type(DbDataType.BLOB),
        //.sleep( (x:NodePropertyState) => { return (x.p != null ? x.p : null )})
        //.wakeUp( (x:NodePropertyState) => { return (x.p != null ? x.p: null )}),
    (new NodeProperty("requires")).def(null)
        .type(DbDataType.BLOB),
    (new NodeProperty("revisions")).def([])
        .type(DbDataType.BLOB),
        //.sleep( (x:NodePropertyState) => { return (x.p != null ? x.p : null )})
        //.wakeUp( (x:NodePropertyState) => { return (x.p != null ? x.p : null )})
]).dataSource("PROJECT_DB").builder(HookSet);

HookStrategy.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
    (new NodeProperty("preprocessor")).type(DbDataType.STRING).def(null),
    (new NodeProperty("on")).type(DbDataType.STRING).def(null),
    (new NodeProperty("enabled")).type(DbDataType.BOOLEAN).def(true),
    (new NodeProperty("deprecated")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("removed")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("onMatch"))
        .type(DbDataType.STRING)
        .def(null)
        .sleep( (x:NodePropertyState) => { return null; })
        .wakeUp( (x:NodePropertyState) => { return (x.self.preprocessor != null ? HookStrategy.newPreprocessorFn(x.self.preprocessor) : null )}),

    (new NodeProperty("loadOn")).type(DbDataType.STRING).def(null),
    (new NodeProperty("unloadOn")).type(DbDataType.STRING).def(null),

    (new NodeProperty("load_kp")).volatile().single(KeyPoint.TYPE).def(null),
    (new NodeProperty("unload_kp")).volatile().single(KeyPoint.TYPE).def(null),

    (new NodeProperty("hookset")).single(HookSet.TYPE).def(null),
    //(HookSet.TYPE.asForeignKey(DbKeyType.FOREIGN, 0, "hookset_id")),
    (new NodeProperty("before"))//.single(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? x.p.toJsonObject() : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookTemplateFragment.fromJsonObject(x.p) : null )}),
    (new NodeProperty("replace"))//.single(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? x.p.toJsonObject() : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookTemplateFragment.fromJsonObject(x.p) : null )}),
    (new NodeProperty("after"))//.single(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? x.p.toJsonObject() : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookTemplateFragment.fromJsonObject(x.p) : null )}),
    (new NodeProperty("hooks")).volatile(),
    (new NodeProperty("search"))
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            return (x.p != null ? x.p.toJsonObject() : null )
        })
        .wakeUp( (x:NodePropertyState) => {
            return (x.p != null ? HookStrategySelector.fromJsonObject(x.p) : null )
        }),
    (new NodeProperty("passed")).type(DbDataType.NUMERIC).def(null),
]).dataSource("PROJECT_DB").builder(HookStrategy);

HookSet.TYPE.updateProperties([
        (new NodeProperty("strats"))
            .multiple(HookStrategy.TYPE)
            //.sleep( (x:NodePropertyState) => { return (x.p != null ? x.p.toJsonObject() : null )})
            //.wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookStrategySelector.fromJsonObject(x.p) : null )}),
            //.multiple(HookStrategy.TYPE,"hookset")
    ])
    .dataSource("PROJECT_DB")
    .builder(HookSet);

HookTemplateFragment.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_descr")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_tpl")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_w")).type(DbDataType.NUMERIC).def(-1),
    (new NodeProperty("_cache")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_preproc")).type(DbDataType.BOOLEAN).def(null),
    (new NodeProperty("_strategy")).single(HookStrategy.TYPE).def(null),
    (new NodeProperty("_keypoint")).type(DbDataType.STRING).def(null),
    (new NodeProperty("deprecated")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("removed")).type(DbDataType.BOOLEAN).def(false),
]).dataSource("PROJECT_DB").builder(HookTemplateFragment);

JavaMethodHook.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_t")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_target")).single(ModelMethod.TYPE),
   // (new NodeProperty("_hookset")).single(BookmarkType.TYPE),
    (new NodeProperty("_code")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_time")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_varID")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_enabled")).type(DbDataType.BOOLEAN).def(true),
    (new NodeProperty("_loadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_unloadkp")).single(KeyPoint.TYPE),

    (new NodeProperty("_after"))
       // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getAfter().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {
            if(x.p!=null && x.p.length>0){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_before"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getBefore().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_replace"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getReplace().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_varMap"))
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            /*if (x.self?.name === "loadDex"){
                console.log('La is do', x.self);
                console.log("VAR MAPPP", (x.self as JavaMethodHook).getVarMap());
            }*/
            if (x.self != null) {
                const o: HookVariableMap = {};
                let methodHook = (x.self as JavaMethodHook);
                for (let i in methodHook.getVarMap()) {
                    o[i] = methodHook.getVariable(i).getData();
                }
                let p:Record<string, any>={};

                return o;
            } else {
                return {};
            }
        })
        .wakeUp( (x:NodePropertyState)=> {
            const o: HookVariableMap = {};
            /*if (x.self?.name === "loadDex"){
                console.log('La is do WAKEUP', x.p);
                console.log("WAKEUP VAR MAPPP");
            }*/
            if (x.p != null && Object.keys(x.p).length>0) {
                for (let i in x.p) {
                    /*console.log('Build a better tomorrow', i);
                    console.log('tomorrow dont wait', x.p[i]);
                    console.log('Are a good type?', typeof x.p[i]);
                    console.log('Red or blue ', x.p[i] instanceof Array);*/
                    if (x.p[i] instanceof Array) {
                        o[i] = new HookVariableArray(x.p[i]);
                    }
                    else {
                        o[i] = new HookVariableObject(x.p[i]);
                    }
                }
            }
            return o;
        })
        .def({}),
]).dataSource("PROJECT_DB").builder(JavaMethodHook);



SystemCallHook.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_t")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_target")).single(ModelMethod.TYPE),
    (new NodeProperty("_code")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_time")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_loadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_unloadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_enabled")).type(DbDataType.BOOLEAN).def(true),
    (new NodeProperty("_after"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as SystemCallHook).getAfter().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {
            if(x.p!=null && x.p.length>0){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_before"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as SystemCallHook).getBefore().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_replace"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as SystemCallHook).getReplace().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        })
]).dataSource("PROJECT_DB").builder(SystemCallHook);

NativeFunctionHook.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_t")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_target")).single(ModelFunction.TYPE),
    (new NodeProperty("_code")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_time")).type(DbDataType.STRING).def(null),
   // (new NodeProperty("_hookset")).single(BookmarkType.TYPE),
    (new NodeProperty("_loadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_unloadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_enabled")).type(DbDataType.BOOLEAN).def(true),
    (new NodeProperty("_after"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getAfter().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_before"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getBefore().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        }),
    (new NodeProperty("_replace"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getReplace().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return o;
            }else{
                return [];
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return [];
            }
        })
]).dataSource("PROJECT_DB").builder(NativeFunctionHook);

Inspector.TYPE.updateProperties([
    (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("description")).type(DbDataType.STRING).def(null),
    (new NodeProperty("context")).volatile().def(null),
    (new NodeProperty("hookSet")).single(HookSet.TYPE).def(null),
    (new NodeProperty("staticTasks")).type(DbDataType.BLOB).def([]),
    (new NodeProperty("running")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("deprecated")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("removed")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("listeners")).type(DbDataType.STRING).def(null),
    (new NodeProperty("gui_available")).type(DbDataType.BOOLEAN).def(false),
    (new NodeProperty("preRegisteredTags")).multiple(TagCategory.TYPE).def([]),
    (new NodeProperty("color")).type(DbDataType.STRING).def(null),
    (new NodeProperty("installed")).type(DbDataType.BOOLEAN).def(null),
    (new NodeProperty("step")).type(DbDataType.STRING).def(INSPECTOR_TYPE.BOOT),
    (new NodeProperty("enabled")).type(DbDataType.BOOLEAN).def(true),
]).dataSource("PROJECT_DB");

TagCategory.TYPE.dataSource("PROJECT_DB");

Tag.TYPE.dataSource("PROJECT_DB");


Brand.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("id")).type(DbDataType.INTEGER),
    (new NodeProperty("logo")).type(DbDataType.STRING).def(""),
    (new NodeProperty("models")).volatile().multiple(DeviceModel.TYPE).def([]),
    (new NodeProperty("deleted_at")).type(DbDataType.INTEGER).def(-1),
    (new NodeProperty("created_at")).type(DbDataType.INTEGER).def(-1),
    (new NodeProperty("updated_at")).type(DbDataType.INTEGER).def(-1),
]).dataSource("MEM");


AssuranceReport.TYPE.updateProperties([
    (new NodeProperty("uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
    (new NodeProperty("line")).type(DbDataType.NUMERIC).def(null),
    (new NodeProperty("application")).type(DbDataType.STRING).def(null),
    (new NodeProperty("device")).type(DbDataType.STRING).def(null),
    (new NodeProperty("values")).type(DbDataType.BLOB).def(null),
    (new NodeProperty("time")).type(DbDataType.NUMERIC).def(null),
    (new NodeProperty("started")).type(DbDataType.NUMERIC).def(null),
    (new NodeProperty("terminated")).type(DbDataType.NUMERIC).def(null),
    (new NodeProperty("primaryAssets")).type(DbDataType.BLOB).def(null),
    (new NodeProperty("secondaryAssets")).type(DbDataType.BLOB).def(null),
    (new NodeProperty("globalThreats")).type(DbDataType.BLOB).def(null),
    (new NodeProperty("primaryAssets")).type(DbDataType.BLOB).def(null),
    (new NodeProperty("tags")).type(DbDataType.STRING),
    (new NodeProperty("project")).single(DexcaliburProject.TYPE),
    /*
    (new NodeProperty("project"))
        .type(DbDataType.BLOB)
        .sleep( (x:NodePropertyState) => {
            if(x.p!=null){
                return (x.p.getUID!=null ? x.p.getUID() : x.p);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                (x.ctx as DexcaliburEngine).getProjectManager().getProject()
                const o = [];
                x.p.map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return x;
            }else{
                return null;
            }
        })
        .def(null),*/
    (new NodeProperty("model")).type(DbDataType.STRING).def(null),
    (new NodeProperty("matches"))
        .type(DbDataType.BLOB)
        .sleep( (x:NodePropertyState) => {
            if(x.p!=null){
                const o:any = {};
                let match:Match;
                for(let k in x.p){
                    match = (x.p)[k] as Match;

                    /*entry = {
                        assessment: x.p[k].assessment.canonicalID,
                        ruleIdx: x.p[k].ruleIdx,
                        match: x.p[k].match,
                    }*/

                    o[k] = AssuranceReport.serializeMatch(match);
                }
                return  o;
            }else{
                return {};
            }
        })
        .wakeUp( (x:NodePropertyState) => {
            if(x.p!=null){
                /*const o:any = {};

                for(let k in x.p){
                    o[k] = AssuranceReport.unserializeMatch(
                        (x.p)[k]
                    );
                }*/
                return x.p;
            }else{
                return {};
            }
        })
        .def({}),
]);

AssuranceModel.TYPE.dataSource("SIGNATURE_DB");

export class NodeSchema{

    static init(){
        // nothing to do
        // BUT KEEP IT TO FORCE INIT (important !)
    }

    /*
    static getNodeTypeByName(){

        export const NodeInternalTypeMapping:IStringIndex<NodeInternalType> = {
            basicBlocks: Model,
            classes: NodeInternalType.CLASS,
            methods: NodeInternalType.METHOD,
            fields: NodeInternalType.FIELD,
            files: NodeInternalType.FILE,
            instr: NodeInternalType.INSTRUCTION,
            metadata: NodeInternalType.METADATA,
            packages: NodeInternalType.PACKAGE,
            // SWITCH_STMT: NodeInternalType.SWITCH_STMT,
            syscalls: NodeInternalType.SYSCALL,
            tagcategories: NodeInternalType.TAG_CATEGORY,
            //CATCH_STMT: NodeInternalType.CATCH_STMT,
            //SWITCH_CASE: NodeInternalType.SWITCH_CASE,
            funcs: NodeInternalType.FUNC,
            //EXEC_SECTION: NodeInternalType.EXEC_SECTION,
            //VAR: NodeInternalType.VAR,
            //INSTR_CPU: NodeInternalType.INSTR_CPU,
            //FILE_SECTION: NodeInternalType.FILE_SECTION,
            //PLATFORM_PPT: NodeInternalType.PLATFORM_PPT,
            //INTERNAL_DB: NodeInternalType.INTERNAL_DB,
            //USER_ACCOUNT: NodeInternalType.USER_ACCOUNT,
            //USER_SESSION: NodeInternalType.USER_SESSION,
            //USER_SESSION_DATA: NodeInternalType.USER_SESSION_DATA,
            //DATA_SCOPE: NodeInternalType.DATA_SCOPE,
            //KEY_POINT: NodeInternalType.KEY_POINT,
            //HOOK_BUILDER_RULE: NodeInternalType.HOOK_BUILDER_RULE,
            //BOOKMARK_TYPE: NodeInternalType.BOOKMARK_TYPE,
            bookmark: NodeInternalType.BOOKMARK,
            //HOOK_JAVA: NodeInternalType.HOOK_JAVA,
            //HOOK_NATIVE: NodeInternalType.HOOK_NATIVE,
            //HOOK_FRAGMENT: NodeInternalType.HOOK_FRAGMENT,
            //HOOK_STRATEGY: NodeInternalType.HOOK_STRATEGY,
            //HOOK_GROUP: NodeInternalType.HOOK_GROUP,
            //HOOK_SET: NodeInternalType.HOOK_SET,
            //SCRIPT: NodeInternalType.SCRIPT,
            //ANAL_STATE: NodeInternalType.ANAL_STATE,
            //tags: NodeInternalType.TAG,
            datablock: NodeInternalType.DATA_BLOCK,
            strings: NodeInternalType.STRING,
            activities: NodeInternalType.ANDROID_ACTIVITY,
            receivers: NodeInternalType.ANDROID_RECEIVER,
            providers: NodeInternalType.ANDROID_PROVIDER,
            services: NodeInternalType.ANDROID_SERVICE,
            permissions: NodeInternalType.ANDROID_PERM,
            //INSPECTOR: NodeInternalType.INSPECTOR,
            //HOOK_SESSION: NodeInternalType.HOOK_SESSION,
            //RUNTIME_EVENT: NodeInternalType.RUNTIME_EVENT,
            //HOOK_SYSCALL: NodeInternalType.HOOK_SYSCALL,
            //LIB_FP: NodeInternalType.LIB_FP,
            //TEST_CREDS: NodeInternalType.TEST_CREDS,
            //DASHBOARD: NodeInternalType.DASHBOARD,
            call: NodeInternalType.CALL,
            //NONE: NodeInternalType.NONE
        }



    }*/
}