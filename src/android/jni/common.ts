

export const JNI = [
        {"name":"reserved0","args":[{"type":"JNIEnv*","name":"env"},{"type":"void*","name":"slot1"},{"type":"void*","name":"slot2"},{"type":"void*","name":"slot3"},{"type":"void*","name":"slot4"},{"type":"void*","name":"slot5"}]},
        {"name":"reserved1","args":[{"type":"JNIEnv*","name":"env"},{"type":"void*","name":"slot1"},{"type":"void*","name":"slot2"},{"type":"void*","name":"slot3"},{"type":"void*","name":"slot4"},{"type":"void*","name":"slot5"}]},
        {"name":"reserved2","args":[{"type":"JNIEnv*","name":"env"},{"type":"void*","name":"slot1"},{"type":"void*","name":"slot2"},{"type":"void*","name":"slot3"},{"type":"void*","name":"slot4"},{"type":"void*","name":"slot5"}]},
        {"name":"reserved3","args":[{"type":"JNIEnv*","name":"env"},{"type":"void*","name":"slot1"},{"type":"void*","name":"slot2"},{"type":"void*","name":"slot3"},{"type":"void*","name":"slot4"},{"type":"void*","name":"slot5"}]},

        {"name":"GetVersion","args":[{"type":"JNIEnv*","name":"env"},{"type":"void*","name":"unused1"},{"type":"void*","name":"unused2"}]},

        {"name":"DefineClass","args":[{"type":"JNIEnv*","name":"env"},{"type":"const char*","name":"name"},{"type":"jobject","name":"loader"},{"type":"const jbyte*","name":"buf"},{"type":"jsize","name":"len"}]},

        {"name":"FindClass","args":[{"type":"JNIEnv*","name":"env"},{"type":"const char*","name":"name"}]},

        {"name":"FromReflectedMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"methodOrConstructor"}]},

        {"name":"FromReflectedField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"field"}]},

        {"name":"ToReflectedMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"methodID"},{"type":"jboolean","name":"isStatic"}]},

        {"name":"GetSuperclass","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"sub"}]},

        {"name":"IsAssignableFrom","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls1"},{"type":"jclass","name":"cls2"}]},

        {"name":"ToReflectedField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jboolean","name":"isStatic"}]},

        {"name":"Throw","args":[{"type":"JNIEnv*","name":"env"},{"type":"jthrowable","name":"thr"}]},

        {"name":"ThrowNew","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"const char*","name":"msg"}]},

        {"name":"ExceptionOccurred","args":[{"type":"JNIEnv*","name":"env"}]},
        {"name":"ExceptionDescribe","args":[{"type":"JNIEnv*","name":"env"}]},
        {"name":"ExceptionClear","args":[{"type":"JNIEnv*","name":"env"}]},

        {"name":"FatalError","args":[{"type":"JNIEnv*","name":"env"},{"type":"const char*","name":"msg"}]},

        {"name":"PushLocalFrame","args":[{"type":"JNIEnv*","name":"env"},{"type":"jint","name":"capacity"}]},
        {"name":"PopLocalFrame","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"result"}]},

        {"name":"NewGlobalRef","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"lref"}]},
        {"name":"DeleteGlobalRef","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"gref"}]},
        {"name":"DeleteLocalRef","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"lref"}]},
        {"name":"IsSameObject","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"a"},{"type":"jobject","name":"b"}]},
        {"name":"NewLocalRef","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"}]},
        {"name":"EnsureLocalCapacity","args":[{"type":"JNIEnv*","name":"env"},{"type":"jint","name":"capacity"}]},

        {"name":"AllocObject","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"}]},
        {"name":"NewObject","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"variadic"},
        {"name":"NewObjectV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"NewObjectA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"GetObjectClass","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"}]},
        {"name":"IsInstanceOf","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"}]},
        {"name":"GetMethodID","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"const char*","name":"name"},{"type":"const char*","name":"sig"}]},

        {"name":"CallObjectMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jobject"},
        {"name":"CallObjectMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallObjectMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallBooleanMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jboolean"},
        {"name":"CallBooleanMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallBooleanMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallByteMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jbyte"},
        {"name":"CallByteMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallByteMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallCharMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jchar"},
        {"name":"CallCharMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallCharMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallShortMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jshort"},
        {"name":"CallShortMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallShortMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallIntMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jint"},
        {"name":"CallIntMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallIntMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallLongMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jlong"},
        {"name":"CallLongMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallLongMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallFloatMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jfloat"},
        {"name":"CallFloatMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallFloatMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallDoubleMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns jdouble"},
        {"name":"CallDoubleMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallDoubleMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallVoidMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}],"extra":"returns void"},
        {"name":"CallVoidMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallVoidMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualObjectMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualObjectMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualObjectMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualBooleanMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualBooleanMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualBooleanMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualByteMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualByteMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualByteMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualCharMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualCharMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualCharMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualShortMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualShortMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualShortMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualIntMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualIntMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualIntMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualLongMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualLongMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualLongMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualFloatMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualFloatMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualFloatMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualDoubleMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualDoubleMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualDoubleMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallNonvirtualVoidMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallNonvirtualVoidMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallNonvirtualVoidMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"GetFieldID","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"const char*","name":"name"},{"type":"const char*","name":"sig"}]},

        {"name":"GetObjectField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetBooleanField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetByteField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetCharField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetShortField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetIntField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetLongField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetFloatField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetDoubleField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"}]},

        {"name":"SetObjectField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jobject","name":"value"}]},
        {"name":"SetBooleanField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jboolean","name":"value"}]},
        {"name":"SetByteField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jbyte","name":"value"}]},
        {"name":"SetCharField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jchar","name":"value"}]},
        {"name":"SetShortField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jshort","name":"value"}]},
        {"name":"SetIntField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jint","name":"value"}]},
        {"name":"SetLongField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jlong","name":"value"}]},
        {"name":"SetFloatField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jfloat","name":"value"}]},
        {"name":"SetDoubleField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"},{"type":"jfieldID","name":"fid"},{"type":"jdouble","name":"value"}]},

        {"name":"GetStaticMethodID","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"const char*","name":"name"},{"type":"const char*","name":"sig"}]},

        {"name":"CallStaticObjectMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticObjectMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticObjectMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticBooleanMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticBooleanMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticBooleanMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticByteMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticByteMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticByteMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticCharMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticCharMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticCharMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticShortMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticShortMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticShortMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticIntMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticIntMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticIntMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticLongMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticLongMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticLongMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticFloatMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticFloatMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticFloatMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticDoubleMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticDoubleMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticDoubleMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"CallStaticVoidMethod","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"...","name":"(varargs)"}]},
        {"name":"CallStaticVoidMethodV","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"va_list","name":"args"}]},
        {"name":"CallStaticVoidMethodA","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jmethodID","name":"mid"},{"type":"jvalue*","name":"args"}]},

        {"name":"GetStaticFieldID","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"const char*","name":"name"},{"type":"const char*","name":"sig"}]},

        {"name":"GetStaticObjectField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticBooleanField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticByteField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticCharField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticShortField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticIntField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticLongField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticFloatField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},
        {"name":"GetStaticDoubleField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"}]},

        {"name":"SetStaticObjectField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jobject","name":"val"}]},
        {"name":"SetStaticBooleanField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jboolean","name":"val"}]},
        {"name":"SetStaticByteField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jbyte","name":"val"}]},
        {"name":"SetStaticCharField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jchar","name":"val"}]},
        {"name":"SetStaticShortField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jshort","name":"val"}]},
        {"name":"SetStaticIntField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jint","name":"val"}]},
        {"name":"SetStaticLongField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jlong","name":"val"}]},
        {"name":"SetStaticFloatField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jfloat","name":"val"}]},
        {"name":"SetStaticDoubleField","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"jfieldID","name":"fid"},{"type":"jdouble","name":"val"}]},

        {"name":"NewString","args":[{"type":"JNIEnv*","name":"env"},{"type":"const jchar*","name":"unicodeChars"},{"type":"jsize","name":"len"}]},
        {"name":"GetStringLength","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"}]},
        {"name":"GetStringChars","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseStringChars","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"const jchar*","name":"chars"}]},
        {"name":"NewStringUTF","args":[{"type":"JNIEnv*","name":"env"},{"type":"const char*","name":"utf"}]},
        {"name":"GetStringUTFLength","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"}]},
        {"name":"GetStringUTFChars","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseStringUTFChars","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"const char*","name":"chars"}]},
        {"name":"GetStringRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jchar*","name":"buf"}]},
        {"name":"GetStringUTFRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"char*","name":"buf"}]},

        {"name":"GetArrayLength","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"}]},
        {"name":"NewObjectArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"},{"type":"jclass","name":"elementClass"},{"type":"jobject","name":"initial"}]},
        {"name":"GetObjectArrayElement","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobjectArray","name":"array"},{"type":"jsize","name":"index"}]},
        {"name":"SetObjectArrayElement","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobjectArray","name":"array"},{"type":"jsize","name":"index"},{"type":"jobject","name":"value"}]},

        {"name":"NewBooleanArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewByteArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewCharArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewShortArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewIntArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewLongArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewFloatArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},
        {"name":"NewDoubleArray","args":[{"type":"JNIEnv*","name":"env"},{"type":"jsize","name":"len"}]},

        {"name":"GetBooleanArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbooleanArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseBooleanArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbooleanArray","name":"array"},{"type":"jboolean*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetBooleanArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbooleanArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jboolean*","name":"buf"}]},
        {"name":"SetBooleanArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbooleanArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jboolean*","name":"buf"}]},

        {"name":"GetByteArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbyteArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseByteArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbyteArray","name":"array"},{"type":"jbyte*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetByteArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbyteArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jbyte*","name":"buf"}]},
        {"name":"SetByteArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jbyteArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jbyte*","name":"buf"}]},

        {"name":"GetCharArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jcharArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseCharArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jcharArray","name":"array"},{"type":"jchar*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetCharArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jcharArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jchar*","name":"buf"}]},
        {"name":"SetCharArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jcharArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jchar*","name":"buf"}]},

        {"name":"GetShortArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jshortArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseShortArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jshortArray","name":"array"},{"type":"jshort*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetShortArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jshortArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jshort*","name":"buf"}]},
        {"name":"SetShortArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jshortArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jshort*","name":"buf"}]},

        {"name":"GetIntArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jintArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseIntArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jintArray","name":"array"},{"type":"jint*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetIntArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jintArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jint*","name":"buf"}]},
        {"name":"SetIntArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jintArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jint*","name":"buf"}]},

        {"name":"GetLongArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jlongArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseLongArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jlongArray","name":"array"},{"type":"jlong*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetLongArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jlongArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jlong*","name":"buf"}]},
        {"name":"SetLongArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jlongArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jlong*","name":"buf"}]},

        {"name":"GetFloatArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jfloatArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseFloatArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jfloatArray","name":"array"},{"type":"jfloat*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetFloatArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jfloatArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jfloat*","name":"buf"}]},
        {"name":"SetFloatArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jfloatArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jfloat*","name":"buf"}]},

        {"name":"GetDoubleArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jdoubleArray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseDoubleArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jdoubleArray","name":"array"},{"type":"jdouble*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetDoubleArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jdoubleArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jdouble*","name":"buf"}]},
        {"name":"SetDoubleArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jdoubleArray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const jdouble*","name":"buf"}]},

        {"name":"ExceptionCheck","args":[{"type":"JNIEnv*","name":"env"}]},
        {"name":"NewWeakGlobalRef","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"}]},
        {"name":"DeleteWeakGlobalRef","args":[{"type":"JNIEnv*","name":"env"},{"type":"jweak","name":"ref"}]},
        {"name":"GetObjectRefType","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"}]},

        {"name":"NewDirectByteBuffer","args":[{"type":"JNIEnv*","name":"env"},{"type":"void*","name":"address"},{"type":"jlong","name":"capacity"}]},
        {"name":"GetDirectBufferAddress","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"buf"}]},
        {"name":"GetDirectBufferCapacity","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"buf"}]},

        {"name":"GetArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"},{"type":"jboolean*","name":"isCopy"}],"extra":"generic alias"},
        {"name":"ReleaseArrayElements","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"},{"type":"void*","name":"elems"},{"type":"jint","name":"mode"}]},
        {"name":"GetArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"void*","name":"buf"}]},
        {"name":"SetArrayRegion","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"const void*","name":"buf"}]},

        {"name":"RegisterNatives","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"},{"type":"JNINativeMethod*","name":"methods"},{"type":"jint","name":"nMethods"}]},
        {"name":"UnregisterNatives","args":[{"type":"JNIEnv*","name":"env"},{"type":"jclass","name":"cls"}]},
        {"name":"MonitorEnter","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"}]},
        {"name":"MonitorExit","args":[{"type":"JNIEnv*","name":"env"},{"type":"jobject","name":"obj"}]},
        {"name":"GetJavaVM","args":[{"type":"JNIEnv*","name":"env"},{"type":"JavaVM**","name":"vm"}]},

        {"name":"GetStringCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseStringCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"const jchar*","name":"chars"}]},
        {"name":"GetStringRegionCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jsize","name":"start"},{"type":"jsize","name":"len"},{"type":"jchar*","name":"buf"}]},

        {"name":"GetPrimitiveArrayCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleasePrimitiveArrayCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jarray","name":"array"},{"type":"void*","name":"carray"},{"type":"jint","name":"mode"}]},

        {"name":"GetStringUTFCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"jboolean*","name":"isCopy"}]},
        {"name":"ReleaseStringUTFCritical","args":[{"type":"JNIEnv*","name":"env"},{"type":"jstring","name":"str"},{"type":"const char*","name":"utf"}]}
    ];



