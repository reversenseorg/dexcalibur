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

function isInstanceOf(raw_ref, fqcn){
    //var cls = "java.lang.String";
    if(raw_ref == null) return false;

    if(typeof raw_ref != "string"){
        var cls = Java.cast(raw_ref.getClass(), CLS.java.lang.Class);
        return cls.getCanonicalName()==fqcn;
    }else{
        return "java.lang.String"==fqcn;
    }
}


DEXC_MODULE.reflect = {
    getSignature: function (cls){
        return "<"+cls.getName()+">";
    },
    castArray: function ( cls, arr){
        var ret = []; 
        var i=0;
        var tmp=null;

        if(arr == null) return null;

        while(null != (tmp = arr[i])){
            ret.push( Java.cast( tmp, cls));
            i++;
        }
        
        return ret;
    },
};

/**
 * To make the Dexcalibur signature (a string) of a given Method instance
 * @param {Object} method An instance of the java.lang.reflect.Method class
 */
DEXC_MODULE.reflect.getMethodSignature = function(method,argTypes){
    var sign="";

    var cls = Java.cast( method.getDeclaringClass(), CLS.java.lang.Class);
    var args = DEXC_MODULE.reflect.castArray( CLS.java.lang.Class, argTypes); // method.getParameterTypes());
    var rett = Java.cast( method.getReturnType(), CLS.java.lang.Class);

    sign += cls.getCanonicalName();
    sign += ".";
    sign += method.getName();
    sign += "(";

    if(args!==null)
        for(var a=0; a<args.length; a++){
            sign += DEXC_MODULE.reflect.getSignature(args[a]);
            if(args[a].isArray()) sign += "[]";
        }

    sign += ")";

    sign += DEXC_MODULE.reflect.getSignature(rett);

    return sign;
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