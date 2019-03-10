.class public Ljava/sql/Types;
.super Ljava/lang/Object;
.source "Types.java"


# static fields
.field public static final ARRAY:I = 0x7d3

.field public static final BIGINT:I = -0x5

.field public static final BINARY:I = -0x2

.field public static final BIT:I = -0x7

.field public static final BLOB:I = 0x7d4

.field public static final BOOLEAN:I = 0x10

.field public static final CHAR:I = 0x1

.field public static final CLOB:I = 0x7d5

.field public static final DATALINK:I = 0x46

.field public static final DATE:I = 0x5b

.field public static final DECIMAL:I = 0x3

.field public static final DISTINCT:I = 0x7d1

.field public static final DOUBLE:I = 0x8

.field public static final FLOAT:I = 0x6

.field public static final INTEGER:I = 0x4

.field public static final JAVA_OBJECT:I = 0x7d0

.field public static final LONGNVARCHAR:I = -0x10

.field public static final LONGVARBINARY:I = -0x4

.field public static final LONGVARCHAR:I = -0x1

.field public static final NCHAR:I = -0xf

.field public static final NCLOB:I = 0x7db

.field public static final NULL:I = 0x0

.field public static final NUMERIC:I = 0x2

.field public static final NVARCHAR:I = -0x9

.field public static final OTHER:I = 0x457

.field public static final REAL:I = 0x7

.field public static final REF:I = 0x7d6

.field public static final ROWID:I = -0x8

.field public static final SMALLINT:I = 0x5

.field public static final SQLXML:I = 0x7d9

.field public static final STRUCT:I = 0x7d2

.field public static final TIME:I = 0x5c

.field public static final TIMESTAMP:I = 0x5d

.field public static final TINYINT:I = -0x6

.field public static final VARBINARY:I = -0x3

.field public static final VARCHAR:I = 0xc


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
