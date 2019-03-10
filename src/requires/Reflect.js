var CLS={
    java:{
        lang: {
            Class: Java.use("java.lang.Class"),
            reflect: {
                AccessibleObject:  Java.use('java.lang.reflect.AccessibleObject'),
                AnnotatedElement:  Java.use('java.lang.reflect.AnnotatedElement'),
                Array:  Java.use('java.lang.reflect.Array'),
                Constructor:  Java.use('java.lang.reflect.Constructor'),
                Field:  Java.use('java.lang.reflect.Field'),
                GenericArrayType:  Java.use('java.lang.reflect.GenericArrayType'),
                GenericDeclaration:  Java.use('java.lang.reflect.GenericDeclaration'),
                GenericSignatureFormatError:  Java.use('java.lang.reflect.GenericSignatureFormatError'),
                InvocationHandler:  Java.use('java.lang.reflect.InvocationHandler'),
                InvocationTargetException:  Java.use('java.lang.reflect.InvocationTargetException'),
                MalformedParameterizedTypeException:  Java.use('java.lang.reflect.MalformedParameterizedTypeException'),
                Member:  Java.use('java.lang.reflect.Member'),
                Method:  Java.use('java.lang.reflect.Method'),
                Modifier:  Java.use('java.lang.reflect.Modifier'),
                ParameterizedType:  Java.use('java.lang.reflect.ParameterizedType'),
                Proxy:  Java.use('java.lang.reflect.Proxy'),
                ReflectPermission:  Java.use('java.lang.reflect.ReflectPermission'),
                Type:  Java.use('java.lang.reflect.Type'),
                TypeVariable:  Java.use('java.lang.reflect.TypeVariable'),
                UndeclaredThrowableException:  Java.use('java.lang.reflect.UndeclaredThrowableException'),
                WildcardType:  Java.use('java.lang.reflect.WildcardType'),
           }
        }
    }
};


function isIntanceOf(raw_ref, fqcn){
    //var cls = "java.lang.String";
    if(typeof raw_ref != "string"){
        var cls = Java.cast(raw_ref.getClass(), CLS.java.lang.Class);
        return cls.getCanonicalName()==fqcn;
    }else{
        return "java.lang.String"==fqcn;
    }
}
/*
function prettySPrint(ref){
    var cls = Java.cast( ref.getClass(), CLS.java.lang.Class);
    var fmt = cls.getCanonicalName()+"[\n";
    var fields = Java.array(CLS.java.lang.reflect.Field, cls.getFields());
    var f=null;
    
    for(var k=0; k<fields.length; k++){
        fields[k]
    };

    return fmt+"]";
}
*/