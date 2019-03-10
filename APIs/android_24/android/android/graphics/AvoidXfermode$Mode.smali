.class public final enum Landroid/graphics/AvoidXfermode$Mode;
.super Ljava/lang/Enum;
.source "AvoidXfermode.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/AvoidXfermode;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Mode"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/AvoidXfermode$Mode;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/AvoidXfermode$Mode;

.field public static final enum AVOID:Landroid/graphics/AvoidXfermode$Mode;

.field public static final enum TARGET:Landroid/graphics/AvoidXfermode$Mode;


# direct methods
.method static constructor <clinit>()V
    .locals 4

    .prologue
    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 8
    new-instance v0, Landroid/graphics/AvoidXfermode$Mode;

    const-string v1, "AVOID"

    invoke-direct {v0, v1, v2}, Landroid/graphics/AvoidXfermode$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/AvoidXfermode$Mode;->AVOID:Landroid/graphics/AvoidXfermode$Mode;

    .line 9
    new-instance v0, Landroid/graphics/AvoidXfermode$Mode;

    const-string v1, "TARGET"

    invoke-direct {v0, v1, v3}, Landroid/graphics/AvoidXfermode$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/AvoidXfermode$Mode;->TARGET:Landroid/graphics/AvoidXfermode$Mode;

    .line 6
    const/4 v0, 0x2

    new-array v0, v0, [Landroid/graphics/AvoidXfermode$Mode;

    sget-object v1, Landroid/graphics/AvoidXfermode$Mode;->AVOID:Landroid/graphics/AvoidXfermode$Mode;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/AvoidXfermode$Mode;->TARGET:Landroid/graphics/AvoidXfermode$Mode;

    aput-object v1, v0, v3

    sput-object v0, Landroid/graphics/AvoidXfermode$Mode;->$VALUES:[Landroid/graphics/AvoidXfermode$Mode;

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
    .line 6
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/AvoidXfermode$Mode;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 6
    const-class v0, Landroid/graphics/AvoidXfermode$Mode;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/AvoidXfermode$Mode;

    return-object v0
.end method

.method public static values()[Landroid/graphics/AvoidXfermode$Mode;
    .locals 1

    .prologue
    .line 6
    sget-object v0, Landroid/graphics/AvoidXfermode$Mode;->$VALUES:[Landroid/graphics/AvoidXfermode$Mode;

    invoke-virtual {v0}, [Landroid/graphics/AvoidXfermode$Mode;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/AvoidXfermode$Mode;

    return-object v0
.end method
