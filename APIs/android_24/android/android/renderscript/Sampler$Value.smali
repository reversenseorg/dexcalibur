.class public final enum Landroid/renderscript/Sampler$Value;
.super Ljava/lang/Enum;
.source "Sampler.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/renderscript/Sampler;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Value"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/renderscript/Sampler$Value;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/renderscript/Sampler$Value;

.field public static final enum CLAMP:Landroid/renderscript/Sampler$Value;

.field public static final enum LINEAR:Landroid/renderscript/Sampler$Value;

.field public static final enum LINEAR_MIP_LINEAR:Landroid/renderscript/Sampler$Value;

.field public static final enum LINEAR_MIP_NEAREST:Landroid/renderscript/Sampler$Value;

.field public static final enum MIRRORED_REPEAT:Landroid/renderscript/Sampler$Value;

.field public static final enum NEAREST:Landroid/renderscript/Sampler$Value;

.field public static final enum WRAP:Landroid/renderscript/Sampler$Value;


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
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "CLAMP"

    invoke-direct {v0, v1, v3}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->CLAMP:Landroid/renderscript/Sampler$Value;

    .line 8
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "LINEAR"

    invoke-direct {v0, v1, v4}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->LINEAR:Landroid/renderscript/Sampler$Value;

    .line 9
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "LINEAR_MIP_LINEAR"

    invoke-direct {v0, v1, v5}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->LINEAR_MIP_LINEAR:Landroid/renderscript/Sampler$Value;

    .line 10
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "LINEAR_MIP_NEAREST"

    invoke-direct {v0, v1, v6}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->LINEAR_MIP_NEAREST:Landroid/renderscript/Sampler$Value;

    .line 11
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "MIRRORED_REPEAT"

    invoke-direct {v0, v1, v7}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->MIRRORED_REPEAT:Landroid/renderscript/Sampler$Value;

    .line 12
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "NEAREST"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->NEAREST:Landroid/renderscript/Sampler$Value;

    .line 13
    new-instance v0, Landroid/renderscript/Sampler$Value;

    const-string v1, "WRAP"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/renderscript/Sampler$Value;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/renderscript/Sampler$Value;->WRAP:Landroid/renderscript/Sampler$Value;

    .line 5
    const/4 v0, 0x7

    new-array v0, v0, [Landroid/renderscript/Sampler$Value;

    sget-object v1, Landroid/renderscript/Sampler$Value;->CLAMP:Landroid/renderscript/Sampler$Value;

    aput-object v1, v0, v3

    sget-object v1, Landroid/renderscript/Sampler$Value;->LINEAR:Landroid/renderscript/Sampler$Value;

    aput-object v1, v0, v4

    sget-object v1, Landroid/renderscript/Sampler$Value;->LINEAR_MIP_LINEAR:Landroid/renderscript/Sampler$Value;

    aput-object v1, v0, v5

    sget-object v1, Landroid/renderscript/Sampler$Value;->LINEAR_MIP_NEAREST:Landroid/renderscript/Sampler$Value;

    aput-object v1, v0, v6

    sget-object v1, Landroid/renderscript/Sampler$Value;->MIRRORED_REPEAT:Landroid/renderscript/Sampler$Value;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/renderscript/Sampler$Value;->NEAREST:Landroid/renderscript/Sampler$Value;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/renderscript/Sampler$Value;->WRAP:Landroid/renderscript/Sampler$Value;

    aput-object v2, v0, v1

    sput-object v0, Landroid/renderscript/Sampler$Value;->$VALUES:[Landroid/renderscript/Sampler$Value;

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

.method public static valueOf(Ljava/lang/String;)Landroid/renderscript/Sampler$Value;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/renderscript/Sampler$Value;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/renderscript/Sampler$Value;

    return-object v0
.end method

.method public static values()[Landroid/renderscript/Sampler$Value;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/renderscript/Sampler$Value;->$VALUES:[Landroid/renderscript/Sampler$Value;

    invoke-virtual {v0}, [Landroid/renderscript/Sampler$Value;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/renderscript/Sampler$Value;

    return-object v0
.end method
