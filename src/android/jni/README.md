

https://cs.android.com/android/platform/superproject/main/+/main:art/runtime/jni/check_jni.cc
```
/*
* Java primitive types:
* B - jbyte
* C - jchar
* D - jdouble
* F - jfloat
* I - jint
* J - jlong
* S - jshort
* Z - jboolean (shown as true and false)
* V - void
*
* Java reference types:
* L - jobject
* a - jarray
* c - jclass
* s - jstring
* t - jthrowable
*
* JNI types:
* b - jboolean (shown as JNI_TRUE and JNI_FALSE)
* f - jfieldID
* i - JNI error value (JNI_OK, JNI_ERR, JNI_EDETACHED, JNI_EVERSION)
* m - jmethodID
* p - void*
* r - jint (for release mode arguments)
* u - const char* (Modified UTF-8)
* z - jsize (for lengths; use i if negative values are okay)
* v - JavaVM*
* w - jobjectRefType
* E - JNIEnv*
* . - no argument; just print "..." (used for varargs JNI calls)
*
*/
```
