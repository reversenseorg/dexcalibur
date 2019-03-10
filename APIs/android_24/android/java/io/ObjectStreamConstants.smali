.class public interface abstract Ljava/io/ObjectStreamConstants;
.super Ljava/lang/Object;
.source "ObjectStreamConstants.java"


# static fields
.field public static final PROTOCOL_VERSION_1:I = 0x1

.field public static final PROTOCOL_VERSION_2:I = 0x2

.field public static final SC_BLOCK_DATA:B = 0x8t

.field public static final SC_ENUM:B = 0x10t

.field public static final SC_EXTERNALIZABLE:B = 0x4t

.field public static final SC_SERIALIZABLE:B = 0x2t

.field public static final SC_WRITE_METHOD:B = 0x1t

.field public static final STREAM_MAGIC:S = -0x5313s

.field public static final STREAM_VERSION:S = 0x5s

.field public static final SUBCLASS_IMPLEMENTATION_PERMISSION:Ljava/io/SerializablePermission;

.field public static final SUBSTITUTION_PERMISSION:Ljava/io/SerializablePermission;

.field public static final TC_ARRAY:B = 0x75t

.field public static final TC_BASE:B = 0x70t

.field public static final TC_BLOCKDATA:B = 0x77t

.field public static final TC_BLOCKDATALONG:B = 0x7at

.field public static final TC_CLASS:B = 0x76t

.field public static final TC_CLASSDESC:B = 0x72t

.field public static final TC_ENDBLOCKDATA:B = 0x78t

.field public static final TC_ENUM:B = 0x7et

.field public static final TC_EXCEPTION:B = 0x7bt

.field public static final TC_LONGSTRING:B = 0x7ct

.field public static final TC_MAX:B = 0x7et

.field public static final TC_NULL:B = 0x70t

.field public static final TC_OBJECT:B = 0x73t

.field public static final TC_PROXYCLASSDESC:B = 0x7dt

.field public static final TC_REFERENCE:B = 0x71t

.field public static final TC_RESET:B = 0x79t

.field public static final TC_STRING:B = 0x74t

.field public static final baseWireHandle:I = 0x7e0000


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 13
    sput-object v0, Ljava/io/ObjectStreamConstants;->SUBCLASS_IMPLEMENTATION_PERMISSION:Ljava/io/SerializablePermission;

    .line 14
    sput-object v0, Ljava/io/ObjectStreamConstants;->SUBSTITUTION_PERMISSION:Ljava/io/SerializablePermission;

    return-void
.end method
