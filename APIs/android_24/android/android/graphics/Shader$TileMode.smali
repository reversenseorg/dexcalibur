.class public final enum Landroid/graphics/Shader$TileMode;
.super Ljava/lang/Enum;
.source "Shader.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/Shader;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "TileMode"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/Shader$TileMode;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/Shader$TileMode;

.field public static final enum CLAMP:Landroid/graphics/Shader$TileMode;

.field public static final enum MIRROR:Landroid/graphics/Shader$TileMode;

.field public static final enum REPEAT:Landroid/graphics/Shader$TileMode;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Landroid/graphics/Shader$TileMode;

    const-string v1, "CLAMP"

    invoke-direct {v0, v1, v2}, Landroid/graphics/Shader$TileMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Shader$TileMode;->CLAMP:Landroid/graphics/Shader$TileMode;

    .line 7
    new-instance v0, Landroid/graphics/Shader$TileMode;

    const-string v1, "MIRROR"

    invoke-direct {v0, v1, v3}, Landroid/graphics/Shader$TileMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Shader$TileMode;->MIRROR:Landroid/graphics/Shader$TileMode;

    .line 8
    new-instance v0, Landroid/graphics/Shader$TileMode;

    const-string v1, "REPEAT"

    invoke-direct {v0, v1, v4}, Landroid/graphics/Shader$TileMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Shader$TileMode;->REPEAT:Landroid/graphics/Shader$TileMode;

    .line 4
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/graphics/Shader$TileMode;

    sget-object v1, Landroid/graphics/Shader$TileMode;->CLAMP:Landroid/graphics/Shader$TileMode;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/Shader$TileMode;->MIRROR:Landroid/graphics/Shader$TileMode;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/Shader$TileMode;->REPEAT:Landroid/graphics/Shader$TileMode;

    aput-object v1, v0, v4

    sput-object v0, Landroid/graphics/Shader$TileMode;->$VALUES:[Landroid/graphics/Shader$TileMode;

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
    .line 4
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/Shader$TileMode;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/graphics/Shader$TileMode;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/Shader$TileMode;

    return-object v0
.end method

.method public static values()[Landroid/graphics/Shader$TileMode;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/graphics/Shader$TileMode;->$VALUES:[Landroid/graphics/Shader$TileMode;

    invoke-virtual {v0}, [Landroid/graphics/Shader$TileMode;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/Shader$TileMode;

    return-object v0
.end method
