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
import {UserAccount} from "./user/UserAccount.js";
import AccessControl from "./user/acl/AccessControl.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import DexcaliburProject from "./DexcaliburProject.js";
import HookStrategySelector from "./hook/HookStrategySelector.js";
import {ModelFunction} from "./ModelFunction.js";


import SystemCallHook from "./hook/SystemCallHook.js";
import {IStringIndex} from "./core/IStringIndex.js";
import {Brand} from "./Brand.js";
import {DeviceModel} from "./DeviceModel.js";
import {
    DataSourceHelper,
    NodePropertyState,
    NodeProperty,
    DbDataType,
    DbKeyType,
    DbSerialize, DataSource, NodeType, TagCategory, Tag
} from "@dexcalibur/dexcalibur-orm";
import InMemoryConnector from "../connectors/inmemory/adapter.js";




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
    (new NodeProperty('_person')).volatile().type(DbDataType.STRING),
    (new NodeProperty('_role')).type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p !=null ? x.p.uid : null) ; } )
        .wakeUp( (x:NodePropertyState) => { return (x.p!=null ? AccessControl.getRole(x.p) : null) }),
]).dataSource("FILE").builder(UserAccount);

UserSession.TYPE.updateProperties([
    // (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),

    (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty('_acc')).single(UserAccount.TYPE).notnull(),
    (new NodeProperty('_created')).type(DbDataType.INTEGER),
    (new NodeProperty('_destroyed')).type(DbDataType.INTEGER),
    (new NodeProperty('_project')).volatile().type(DbDataType.STRING).serialize(DbSerialize.JSON),
    (new NodeProperty('_defaultProject')).type(DbDataType.STRING)
        .sleep( (x:NodePropertyState)=>{ return (x.p!=null? x.p.getUID() : null)})
        .wakeUp( (x:NodePropertyState) =>  { return (x.p!=null ? (x.ctx as DexcaliburEngine).getProject(x.p) : null)}),

    (new NodeProperty('_conn')).type(DbDataType.STRING)
        .sleep( (x:NodePropertyState)=>{ return null; })
        .wakeUp( (x:NodePropertyState) =>  { return x.p })
]).dataSource("FILE").builder(UserSession);

SessionData.TYPE.updateProperties([
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
        })
]).dataSource("FILE").builder(SessionData);

UserSession.TYPE.updateProperties([
    (new NodeProperty('_data')).multiple(SessionData.TYPE)
]);




ModelMethod.TYPE.updateProperties([
        (new NodeProperty("__signature__")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        (new NodeProperty("name")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
        (new NodeProperty("modifier")).volatile(),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
            .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),
        (new NodeProperty("alias")).type(DbDataType.STRING),
        (new NodeProperty("args")).volatile(),
        (new NodeProperty("ret")).volatile(),
        (new NodeProperty("instr")).volatile(), //.multiple(ModelBasicBlock.TYPE),
        (new NodeProperty("datas")).volatile(),
        (new NodeProperty("switches")).volatile(),
        (new NodeProperty("probing")).type(DbDataType.BOOLEAN).def(false),

        (new NodeProperty("locals")).type(DbDataType.INTEGER).def(0),
        (new NodeProperty("registers")).type(DbDataType.INTEGER).def(0),
        (new NodeProperty("params")).volatile(),

        (new NodeProperty("enclosingClass")).single(ModelClass.TYPE),
        (new NodeProperty("declaringClass")).single(ModelClass.TYPE),
        (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]"),
    ]).dataSource("MEM").builder(ModelMethod);


ModelField.TYPE.updateProperties([
        (new NodeProperty("__signature__")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
        (new NodeProperty("fqcn")).type(DbDataType.STRING).unique(), //.key(DbKeyType.PRIMARY),
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
            .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
            .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),
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

            (new NodeProperty("package")).single(ModelPackage.TYPE),
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
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
                .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),

            (new NodeProperty("_callers")).volatile().multiple(ModelMethod.TYPE),
            (new NodeProperty("_hashcode")).type(DbDataType.STRING),
            (new NodeProperty("_isBinding")).type(DbDataType.BOOLEAN),
            (new NodeProperty("__pretty_signature__")).type(DbDataType.STRING),
            (new NodeProperty("__aliasedCallSignature__")).type(DbDataType.STRING),
            (new NodeProperty("__p"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
                .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )})

    ]).dataSource("MEM").builder(ModelClass);


KeyPoint.TYPE.updateProperties([
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("token")).type(DbDataType.STRING).def(null),
        (new NodeProperty("description")).type(DbDataType.STRING).def(null),
        (new NodeProperty("code")).type(DbDataType.STRING).def(null),
        (new NodeProperty("generator"))
            .type(DbDataType.STRING)
            .sleep(x => { return (x!=null ? x.toString() : null) })
            .wakeUp( x => { return null  }) // (x != null ? Function(x) : null)
            .def(null),
        (new NodeProperty("type")).type(DbDataType.NUMERIC),
        (new NodeProperty("weight")).type(DbDataType.NUMERIC),
        (new NodeProperty("enabled")).type(DbDataType.BOOLEAN),
        (new NodeProperty("deps"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
            .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),
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
                return JSON.stringify(o);
            })
            .wakeUp( (x:NodePropertyState) => {
                const o = {};
                JSON.parse(x.p).map( v => {
                    o[v.uid] = v;
                });
                return o;
            })
        ]).dataSource("FILE").builder(KeyPoint);



BookmarkType.TYPE.updateProperties([
        (new NodeProperty("id")).type(DbDataType.NUMERIC).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING).unique(),
        (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
        (new NodeProperty("priority")).type(DbDataType.NUMERIC).def(null),
        (new NodeProperty("theme"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
            .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )})
    ]).dataSource("FILE").builder(BookmarkType);

Bookmark.TYPE.updateProperties([
    (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
    (new NodeProperty("category")).type(DbDataType.STRING).def(null),
    (new NodeProperty("type")).single(BookmarkType.TYPE)
]).dataSource("FILE").builder(Bookmark);


HookSet.TYPE.updateProperties([
    (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).unique(),
    (new NodeProperty("description")).type(DbDataType.STRING).def(null),
    (new NodeProperty("category")).type(DbDataType.STRING).def(null),
    (new NodeProperty("prologue")).volatile(),
    (new NodeProperty("color")).def(null)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),
    (new NodeProperty("share")).def(null)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )}),
    (new NodeProperty("requires")).def(null)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )})
]).dataSource("FILE").builder(HookSet);

HookStrategy.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
    (new NodeProperty("preprocessor")).type(DbDataType.STRING).def(null),
    (new NodeProperty("on")).type(DbDataType.STRING).def(null),
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
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p.toJsonObject()) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookTemplateFragment.fromJsonObject(JSON.parse(x.p)) : null )}),
    (new NodeProperty("replace"))//.single(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p.toJsonObject()) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookTemplateFragment.fromJsonObject(JSON.parse(x.p)) : null )}),
    (new NodeProperty("after"))//.single(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p.toJsonObject()) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookTemplateFragment.fromJsonObject(JSON.parse(x.p)) : null )}),
    (new NodeProperty("hooks")).volatile(),
    (new NodeProperty("search"))
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p.toJsonObject()) : null )})
        .wakeUp( (x:NodePropertyState) => { return (x.p != null ? HookStrategySelector.fromJsonObject(JSON.parse(x.p)) : null )}),
    (new NodeProperty("passed")).type(DbDataType.NUMERIC).def(null),
]).dataSource("FILE").builder(HookStrategy);

HookSet.TYPE.updateProperties([(new NodeProperty("strats")).multiple(HookStrategy.TYPE,"hookset")]);

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
]).dataSource("FILE").builder(JavaMethodHook);

JavaMethodHook.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_t")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_target")).single(ModelMethod.TYPE),
   // (new NodeProperty("_hookset")).single(BookmarkType.TYPE),
    (new NodeProperty("_code")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_time")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_loadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_unloadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_after"))
       // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getAfter().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {
            if(x.p!=null && x.p.length>0){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        }),
    (new NodeProperty("_before"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getBefore().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        }),
    (new NodeProperty("_replace"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getReplace().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        })
]).dataSource("FILE").builder(JavaMethodHook);



SystemCallHook.TYPE.updateProperties([
    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("name")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_t")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_target")).single(ModelMethod.TYPE),
    (new NodeProperty("_code")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_time")).type(DbDataType.STRING).def(null),
    (new NodeProperty("_loadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_unloadkp")).single(KeyPoint.TYPE),
    (new NodeProperty("_after"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as SystemCallHook).getAfter().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {
            if(x.p!=null && x.p.length>0){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        }),
    (new NodeProperty("_before"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as SystemCallHook).getBefore().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        }),
    (new NodeProperty("_replace"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as SystemCallHook).getReplace().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null && x.p.length>0){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        })
]).dataSource("FILE").builder(SystemCallHook);

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
    (new NodeProperty("_after"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getAfter().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        }),
    (new NodeProperty("_before"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getBefore().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        }),
    (new NodeProperty("_replace"))
        // .multiple(HookTemplateFragment.TYPE)
        .type(DbDataType.STRING)
        .sleep( (x:NodePropertyState) => {
            if(x.self!=null){
                const o = [];
                (x.self as JavaMethodHook).getReplace().map( (t:HookTemplateFragment) => { o.push(t.toJsonObject()) } );
                return JSON.stringify(o);
            }else{
                return null;
            }
        })
        .wakeUp( (x:NodePropertyState) => {

            if(x.p!=null){
                const o = [];
                JSON.parse(x.p).map( (data) => {
                    o.push( HookTemplateFragment.fromJsonObject(data));
                } );
                return o;
            }else{
                return null;
            }
        })
]).dataSource("FILE").builder(NativeFunctionHook);

TagCategory.TYPE.dataSource("FILE");

Tag.TYPE.dataSource("FILE");


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