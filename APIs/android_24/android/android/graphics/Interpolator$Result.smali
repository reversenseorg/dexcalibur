.class public final enum Landroid/graphics/Interpolator$Result;
.super Ljava/lang/Enum;
.source "Interpolator.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/Interpolator;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Result"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/Interpolator$Result;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/Interpolator$Result;

.field public static final enum FREEZE_END:Landroid/graphics/Interpolator$Result;

.field public static final enum FREEZE_START:Landroid/graphics/Interpolator$Result;

.field public static final enum NORMAL:Landroid/graphics/Interpolator$Result;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Landroid/graphics/Interpolator$Result;

    const-string v1, "FREEZE_END"

    invoke-direct {v0, v1, v2}, Landroid/graphics/Interpolator$Result;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Interpolator$Result;->FREEZE_END:Landroid/graphics/Interpolator$Result;

    .line 7
    new-instance v0, Landroid/graphics/Interpolator$Result;

    const-string v1, "FREEZE_START"

    invoke-direct {v0, v1, v3}, Landroid/graphics/Interpolator$Result;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Interpolator$Result;->FREEZE_START:Landroid/graphics/Interpolator$Result;

    .line 8
    new-instance v0, Landroid/graphics/Interpolator$Result;

    const-string v1, "NORMAL"

    invoke-direct {v0, v1, v4}, Landroid/graphics/Interpolator$Result;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Interpolator$Result;->NORMAL:Landroid/graphics/Interpolator$Result;

    .line 4
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/graphics/Interpolator$Result;

    sget-object v1, Landroid/graphics/Interpolator$Result;->FREEZE_END:Landroid/graphics/Interpolator$Result;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/Interpolator$Result;->FREEZE_START:Landroid/graphics/Interpolator$Result;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/Interpolator$Result;->NORMAL:Landroid/graphics/Interpolator$Result;

    aput-object v1, v0, v4

    sput-object v0, Landroid/graphics/Interpolator$Result;->$VALUES:[Landroid/graphics/Interpolator$Result;

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

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/Interpolator$Result;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/graphics/Interpolator$Result;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/Interpolator$Result;

    return-object v0
.end method

.method public static values()[Landroid/graphics/Interpolator$Result;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/graphics/Interpolator$Result;->$VALUES:[Landroid/graphics/Interpolator$Result;

    invoke-virtual {v0}, [Landroid/graphics/Interpolator$Result;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/Interpolator$Result;

    return-object v0
.end method
