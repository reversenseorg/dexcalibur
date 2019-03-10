.class public final enum Landroid/renderscript/Element$DataType;
.super Ljava/lang/Enum;
.source "Element.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/renderscript/Element;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "DataType"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/renderscript/Element$DataType;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/renderscript/Element$DataType;

.field public static final enum BOOLEAN:Landroid/renderscript/Element$DataType;

.field public static final enum FLOAT_32:Landroid/renderscript/Element$DataType;

.field public static final enum FLOAT_64:Landroid/renderscript/Element$DataType;

.field public static final enum MATRIX_2X2:Landroid/renderscript/Element$DataType;

.field public static final enum MATRIX_3X3:Landroid/renderscript/Element$DataType;

.field public static final enum MATRIX_4X4:Landroid/renderscript/Element$DataType;

.field public static final enum NONE:Landroid/renderscript/Element$DataType;

.field public static final enum RS_ALLOCATION:Landroid/renderscript/Element$DataType;

.field public static final enum RS_ELEMENT:Landroid/renderscript/Element$DataType;

.field public static final enum RS_FONT:Landroid/renderscript/Element$DataType;

.field public static final enum RS_MESH:Landroid/renderscript/Element$DataType;

.field public static final enum RS_PROGRAM_FRAGMENT:Landroid/renderscript/Element$DataType;

.field public static final enum RS_PROGRAM_RASTER:Landroid/renderscript/Element$DataType;

.field public static final enum RS_PROGRAM_STORE:Landroid/renderscript/Element$DataType;

.field public static final enum RS_PROGRAM_VERTEX:Landroid/renderscript/Element$DataType;

.field public static final enum RS_SAMPLER:Landroid/renderscript/Element$DataType;

.field public static final enum RS_SCRIPT:Landroid/renderscript/Element$DataType;

.field public static final enum RS_TYPE:Landroid/renderscript/Element$DataType;

.field public static final enum SIGNED_16:Landroid/renderscript/Element$DataType;

.field public static final enum SIGNED_32:Landroid/renderscript/Element$DataType;

.field public static final enum SIGNED_64:Landroid/renderscript/Element$DataType;

.field public static final enum SIGNED_8:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_16:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_32:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_4_4_4_4:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_5_5_5_1:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_5_6_5:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_64:Landroid/renderscript/Element$DataType;

.field public static final enum UNSIGNED_8:Landroid/renderscript/Element$DataType;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 7
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "BOOLEAN"

    invoke-direct {v0, v1, v3}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->BOOLEAN:Landroid/renderscript/Element$DataType;

    .line 8
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "FLOAT_32"

    invoke-direct {v0, v1, v4}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->FLOAT_32:Landroid/renderscript/Element$DataType;

    .line 9
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "FLOAT_64"

    invoke-direct {v0, v1, v5}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->FLOAT_64:Landroid/renderscript/Element$DataType;

    .line 10
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "MATRIX_2X2"

    invoke-direct {v0, v1, v6}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->MATRIX_2X2:Landroid/renderscript/Element$DataType;

    .line 11
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "MATRIX_3X3"

    invoke-direct {v0, v1, v7}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->MATRIX_3X3:Landroid/renderscript/Element$DataType;

    .line 12
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "MATRIX_4X4"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->MATRIX_4X4:Landroid/renderscript/Element$DataType;

    .line 13
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "NONE"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->NONE:Landroid/renderscript/Element$DataType;

    .line 14
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_ALLOCATION"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_ALLOCATION:Landroid/renderscript/Element$DataType;

    .line 15
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_ELEMENT"

    const/16 v2, 0x8

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_ELEMENT:Landroid/renderscript/Element$DataType;

    .line 16
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_FONT"

    const/16 v2, 0x9

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_FONT:Landroid/renderscript/Element$DataType;

    .line 17
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_MESH"

    const/16 v2, 0xa

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_MESH:Landroid/renderscript/Element$DataType;

    .line 18
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_PROGRAM_FRAGMENT"

    const/16 v2, 0xb

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_PROGRAM_FRAGMENT:Landroid/renderscript/Element$DataType;

    .line 19
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_PROGRAM_RASTER"

    const/16 v2, 0xc

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_PROGRAM_RASTER:Landroid/renderscript/Element$DataType;

    .line 20
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_PROGRAM_STORE"

    const/16 v2, 0xd

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_PROGRAM_STORE:Landroid/renderscript/Element$DataType;

    .line 21
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_PROGRAM_VERTEX"

    const/16 v2, 0xe

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_PROGRAM_VERTEX:Landroid/renderscript/Element$DataType;

    .line 22
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_SAMPLER"

    const/16 v2, 0xf

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_SAMPLER:Landroid/renderscript/Element$DataType;

    .line 23
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_SCRIPT"

    const/16 v2, 0x10

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_SCRIPT:Landroid/renderscript/Element$DataType;

    .line 24
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "RS_TYPE"

    const/16 v2, 0x11

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->RS_TYPE:Landroid/renderscript/Element$DataType;

    .line 25
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "SIGNED_16"

    const/16 v2, 0x12

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->SIGNED_16:Landroid/renderscript/Element$DataType;

    .line 26
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "SIGNED_32"

    const/16 v2, 0x13

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->SIGNED_32:Landroid/renderscript/Element$DataType;

    .line 27
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "SIGNED_64"

    const/16 v2, 0x14

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->SIGNED_64:Landroid/renderscript/Element$DataType;

    .line 28
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "SIGNED_8"

    const/16 v2, 0x15

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->SIGNED_8:Landroid/renderscript/Element$DataType;

    .line 29
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_16"

    const/16 v2, 0x16

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_16:Landroid/renderscript/Element$DataType;

    .line 30
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_32"

    const/16 v2, 0x17

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_32:Landroid/renderscript/Element$DataType;

    .line 31
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_4_4_4_4"

    const/16 v2, 0x18

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_4_4_4_4:Landroid/renderscript/Element$DataType;

    .line 32
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_5_5_5_1"

    const/16 v2, 0x19

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_5_5_5_1:Landroid/renderscript/Element$DataType;

    .line 33
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_5_6_5"

    const/16 v2, 0x1a

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_5_6_5:Landroid/renderscript/Element$DataType;

    .line 34
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_64"

    const/16 v2, 0x1b

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_64:Landroid/renderscript/Element$DataType;

    .line 35
    new-instance v0, Landroid/renderscript/Element$DataType;

    const-string v1, "UNSIGNED_8"

    const/16 v2, 0x1c

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Element$DataType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Element$DataType;->UNSIGNED_8:Landroid/renderscript/Element$DataType;

    .line 5
    const/16 v0, 0x1d

    new-array v0, v0, [Landroid/renderscript/Element$DataType;

    sget-object v1, Landroid/renderscript/Element$DataType;->BOOLEAN:Landroid/renderscript/Element$DataType;

    aput-object v1, v0, v3

    sget-object v1, Landroid/renderscript/Element$DataType;->FLOAT_32:Landroid/renderscript/Element$DataType;

    aput-object v1, v0, v4

    sget-object v1, Landroid/renderscript/Element$DataType;->FLOAT_64:Landroid/renderscript/Element$DataType;

    aput-object v1, v0, v5

    sget-object v1, Landroid/renderscript/Element$DataType;->MATRIX_2X2:Landroid/renderscript/Element$DataType;

    aput-object v1, v0, v6

    sget-object v1, Landroid/renderscript/Element$DataType;->MATRIX_3X3:Landroid/renderscript/Element$DataType;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/renderscript/Element$DataType;->MATRIX_4X4:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/renderscript/Element$DataType;->NONE:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_ALLOCATION:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x8

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_ELEMENT:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x9

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_FONT:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0xa

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_MESH:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0xb

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_PROGRAM_FRAGMENT:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0xc

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_PROGRAM_RASTER:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0xd

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_PROGRAM_STORE:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0xe

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_PROGRAM_VERTEX:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0xf

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_SAMPLER:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x10

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_SCRIPT:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x11

    sget-object v2, Landroid/renderscript/Element$DataType;->RS_TYPE:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x12

    sget-object v2, Landroid/renderscript/Element$DataType;->SIGNED_16:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x13

    sget-object v2, Landroid/renderscript/Element$DataType;->SIGNED_32:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x14

    sget-object v2, Landroid/renderscript/Element$DataType;->SIGNED_64:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x15

    sget-object v2, Landroid/renderscript/Element$DataType;->SIGNED_8:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x16

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_16:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x17

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_32:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x18

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_4_4_4_4:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x19

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_5_5_5_1:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x1a

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_5_6_5:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x1b

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_64:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    const/16 v1, 0x1c

    sget-object v2, Landroid/renderscript/Element$DataType;->UNSIGNED_8:Landroid/renderscript/Element$DataType;

    aput-object v2, v0, v1

    sput-object v0, Landroid/renderscript/Element$DataType;->$VALUES:[Landroid/renderscript/Element$DataType;

    return-void
.end method

.method private constructor <init>(Ljava/lang/String;I)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()V"
        }
    .end annotation

    .prologue
    .line 5
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/renderscript/Element$DataType;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/renderscript/Element$DataType;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/renderscript/Element$DataType;

    return-object v0
.end method

.method public static values()[Landroid/renderscript/Element$DataType;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/renderscript/Element$DataType;->$VALUES:[Landroid/renderscript/Element$DataType;

    invoke-virtual {v0}, [Landroid/renderscript/Element$DataType;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/renderscript/Element$DataType;

    return-object v0
.end method
