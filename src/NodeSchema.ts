import ModelMethod from "./ModelMethod.js";
import {NodeProperty, NodePropertyState} from "./persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "./persist/orm/DbAbstraction.js";
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
import {DataSourceHelper} from "./DataSourceHelper.js";
import {INodeMap} from "./INode.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {DataSource} from "./DataSource.js";
import {TagCategory} from "./tags/TagCategory.js";
import {Tag} from "./tags/Tag.js";
import SystemCallHook from "./hook/SystemCallHook.js";

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
]).dataSource(DataSourceHelper.FILE).builder(UserAccount);

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
]).dataSource(DataSourceHelper.FILE).builder(UserSession);

SessionData.TYPE.updateProperties([
    UserSession.TYPE.asForeignKey(DbKeyType.COMPOSITE, 0),
    (new NodeProperty('_name')).type(DbDataType.STRING).key(DbKeyType.COMPOSITE, 1),
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
]).dataSource(DataSourceHelper.FILE).builder(SessionData);

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
    ]).builder(ModelMethod);


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
    ]).builder(ModelField);


ModelPackage.TYPE.updateProperties([
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            (new NodeProperty("sname")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("children")).volatile(),
            (new NodeProperty("tags")).type(DbDataType.STRING),
            (new NodeProperty("alias")).type(DbDataType.STRING),
    ]).builder(ModelPackage);


ModelClass.TYPE.updateProperties([
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            (new NodeProperty("simpleName")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("alias")).type(DbDataType.STRING),
            (new NodeProperty("source")).type(DbDataType.STRING),
            (new NodeProperty("modifiers")).type(DbDataType.STRING),

            (new NodeProperty("package")).single(ModelPackage.TYPE),
            (new NodeProperty("implements")).single(ModelClass.TYPE),
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

    ]).builder(ModelClass);


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
        ]).dataSource(DataSourceHelper.FILE).builder(KeyPoint);



BookmarkType.TYPE.updateProperties([
        (new NodeProperty("id")).type(DbDataType.NUMERIC).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING).unique(),
        (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
        (new NodeProperty("priority")).type(DbDataType.NUMERIC).def(null),
        (new NodeProperty("theme"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState) => { return (x.p != null ? JSON.stringify(x.p) : null )})
            .wakeUp( (x:NodePropertyState) => { return (x.p != null ? JSON.parse(x.p) : null )})
    ]).dataSource(DataSourceHelper.FILE).builder(BookmarkType);

Bookmark.TYPE.updateProperties([
    (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty("descr")).type(DbDataType.STRING).def(null),
    (new NodeProperty("category")).type(DbDataType.STRING).def(null),
    (new NodeProperty("type")).single(BookmarkType.TYPE)
]).dataSource(DataSourceHelper.FILE).builder(Bookmark);


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
]).dataSource(DataSourceHelper.FILE).builder(HookSet);

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
]).dataSource(DataSourceHelper.FILE).builder(HookStrategy);

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
]).dataSource(DataSourceHelper.FILE).builder(JavaMethodHook);

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
]).dataSource(DataSourceHelper.FILE).builder(JavaMethodHook);



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
]).dataSource(DataSourceHelper.FILE).builder(SystemCallHook);

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
]).dataSource(DataSourceHelper.FILE).builder(NativeFunctionHook);

TagCategory.TYPE.updateProperties([
    (new NodeProperty('name')).type(DbDataType.STRING).key(DbKeyType.PRIMARY).notnull(),
    (new NodeProperty('descr')).type(DbDataType.STRING),
    (new NodeProperty('_tags')).volatile().multiple(Tag.TYPE),
    (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]"),
]).dataSource(DataSourceHelper.FILE).builder(TagCategory);

Tag.TYPE.updateProperties([
    (new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
    (new NodeProperty('_')).type(DbDataType.NUMERIC),
    (new NodeProperty('label')).type(DbDataType.STRING),
    (new NodeProperty('name')).type(DbDataType.STRING),
    (new NodeProperty('descr')).type(DbDataType.STRING),
    (new NodeProperty('category')).single(TagCategory.TYPE),
    (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]"),
    (new NodeProperty("style")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("{}"),
]).dataSource(DataSourceHelper.FILE).builder(Tag);

export class NodeSchema{

    static init(){
        // nothing to do
        // BUT KEEP IT TO FORCE INIT (important !)
    }
}