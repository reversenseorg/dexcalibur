.class public final enum Landroid/renderscript/Type$CubemapFace;
.super Ljava/lang/Enum;
.source "Type.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/renderscript/Type;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "CubemapFace"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/renderscript/Type$CubemapFace;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/renderscript/Type$CubemapFace;

.field public static final enum NEGATIVE_X:Landroid/renderscript/Type$CubemapFace;

.field public static final enum NEGATIVE_Y:Landroid/renderscript/Type$CubemapFace;

.field public static final enum NEGATIVE_Z:Landroid/renderscript/Type$CubemapFace;

.field public static final enum POSITIVE_X:Landroid/renderscript/Type$CubemapFace;

.field public static final enum POSITIVE_Y:Landroid/renderscript/Type$CubemapFace;

.field public static final enum POSITIVE_Z:Landroid/renderscript/Type$CubemapFace;

.field public static final enum POSITVE_X:Landroid/renderscript/Type$CubemapFace;

.field public static final enum POSITVE_Y:Landroid/renderscript/Type$CubemapFace;

.field public static final enum POSITVE_Z:Landroid/renderscript/Type$CubemapFace;


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
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "NEGATIVE_X"

    invoke-direct {v0, v1, v3}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->NEGATIVE_X:Landroid/renderscript/Type$CubemapFace;

    .line 8
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "NEGATIVE_Y"

    invoke-direct {v0, v1, v4}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->NEGATIVE_Y:Landroid/renderscript/Type$CubemapFace;

    .line 9
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "NEGATIVE_Z"

    invoke-direct {v0, v1, v5}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->NEGATIVE_Z:Landroid/renderscript/Type$CubemapFace;

    .line 10
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "POSITIVE_X"

    invoke-direct {v0, v1, v6}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->POSITIVE_X:Landroid/renderscript/Type$CubemapFace;

    .line 11
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "POSITIVE_Y"

    invoke-direct {v0, v1, v7}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->POSITIVE_Y:Landroid/renderscript/Type$CubemapFace;

    .line 12
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "POSITIVE_Z"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->POSITIVE_Z:Landroid/renderscript/Type$CubemapFace;

    .line 13
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "POSITVE_X"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->POSITVE_X:Landroid/renderscript/Type$CubemapFace;

    .line 14
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "POSITVE_Y"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->POSITVE_Y:Landroid/renderscript/Type$CubemapFace;

    .line 15
    new-instance v0, Landroid/renderscript/Type$CubemapFace;

    const-string v1, "POSITVE_Z"

    const/16 v2, 0x8

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Type$CubemapFace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->POSITVE_Z:Landroid/renderscript/Type$CubemapFace;

    .line 5
    const/16 v0, 0x9

    new-array v0, v0, [Landroid/renderscript/Type$CubemapFace;

    sget-object v1, Landroid/renderscript/Type$CubemapFace;->NEGATIVE_X:Landroid/renderscript/Type$CubemapFace;

    aput-object v1, v0, v3

    sget-object v1, Landroid/renderscript/Type$CubemapFace;->NEGATIVE_Y:Landroid/renderscript/Type$CubemapFace;

    aput-object v1, v0, v4

    sget-object v1, Landroid/renderscript/Type$CubemapFace;->NEGATIVE_Z:Landroid/renderscript/Type$CubemapFace;

    aput-object v1, v0, v5

    sget-object v1, Landroid/renderscript/Type$CubemapFace;->POSITIVE_X:Landroid/renderscript/Type$CubemapFace;

    aput-object v1, v0, v6

    sget-object v1, Landroid/renderscript/Type$CubemapFace;->POSITIVE_Y:Landroid/renderscript/Type$CubemapFace;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/renderscript/Type$CubemapFace;->POSITIVE_Z:Landroid/renderscript/Type$CubemapFace;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/renderscript/Type$CubemapFace;->POSITVE_X:Landroid/renderscript/Type$CubemapFace;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Landroid/renderscript/Type$CubemapFace;->POSITVE_Y:Landroid/renderscript/Type$CubemapFace;

    aput-object v2, v0, v1

    const/16 v1, 0x8

    sget-object v2, Landroid/renderscript/Type$CubemapFace;->POSITVE_Z:Landroid/renderscript/Type$CubemapFace;

    aput-object v2, v0, v1

    sput-object v0, Landroid/renderscript/Type$CubemapFace;->$VALUES:[Landroid/renderscript/Type$CubemapFace;

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

.method public static valueOf(Ljava/lang/String;)Landroid/renderscript/Type$CubemapFace;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/renderscript/Type$CubemapFace;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/renderscript/Type$CubemapFace;

    return-object v0
.end method

.method public static values()[Landroid/renderscript/Type$CubemapFace;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/renderscript/Type$CubemapFace;->$VALUES:[Landroid/renderscript/Type$CubemapFace;

    invoke-virtual {v0}, [Landroid/renderscript/Type$CubemapFace;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/renderscript/Type$CubemapFace;

    return-object v0
.end method
