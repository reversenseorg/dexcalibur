import ModelMethod from "./ModelMethod";
import {NodeType} from "./persist/orm/NodeType";
import {NodeInternalType} from "./NodeInternalType";
import {NodeProperty, NodePropertyState} from "./persist/orm/NodeProperty";
import {DbDataType, DbKeyType} from "./persist/orm/DbAbstraction";
import ModelField from "./ModelField";
import ModelPackage from "./ModelPackage";
import ModelClass from "./ModelClass";


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
        (new NodeProperty("declaringClass")).single(ModelClass.TYPE)
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

export class NodeSchema{

    static init(){}
}