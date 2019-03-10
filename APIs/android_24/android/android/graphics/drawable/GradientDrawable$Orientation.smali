.class public final enum Landroid/graphics/drawable/GradientDrawable$Orientation;
.super Ljava/lang/Enum;
.source "GradientDrawable.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/drawable/GradientDrawable;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Orientation"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/drawable/GradientDrawable$Orientation;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum BL_TR:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum BOTTOM_TOP:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum BR_TL:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum LEFT_RIGHT:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum RIGHT_LEFT:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum TL_BR:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum TOP_BOTTOM:Landroid/graphics/drawable/GradientDrawable$Orientation;

.field public static final enum TR_BL:Landroid/graphics/drawable/GradientDrawable$Orientation;


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
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "BL_TR"

    invoke-direct {v0, v1, v3}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->BL_TR:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 8
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "BOTTOM_TOP"

    invoke-direct {v0, v1, v4}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->BOTTOM_TOP:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 9
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "BR_TL"

    invoke-direct {v0, v1, v5}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->BR_TL:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 10
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "LEFT_RIGHT"

    invoke-direct {v0, v1, v6}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->LEFT_RIGHT:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 11
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "RIGHT_LEFT"

    invoke-direct {v0, v1, v7}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->RIGHT_LEFT:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 12
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "TL_BR"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->TL_BR:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 13
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "TOP_BOTTOM"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->TOP_BOTTOM:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 14
    new-instance v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    const-string v1, "TR_BL"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Landroid/graphics/drawable/GradientDrawable$Orientation;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->TR_BL:Landroid/graphics/drawable/GradientDrawable$Orientation;

    .line 5
    const/16 v0, 0x8

    new-array v0, v0, [Landroid/graphics/drawable/GradientDrawable$Orientation;

    sget-object v1, Landroid/graphics/drawable/GradientDrawable$Orientation;->BL_TR:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/drawable/GradientDrawable$Orientation;->BOTTOM_TOP:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v1, v0, v4

    sget-object v1, Landroid/graphics/drawable/GradientDrawable$Orientation;->BR_TL:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v1, v0, v5

    sget-object v1, Landroid/graphics/drawable/GradientDrawable$Orientation;->LEFT_RIGHT:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v1, v0, v6

    sget-object v1, Landroid/graphics/drawable/GradientDrawable$Orientation;->RIGHT_LEFT:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/graphics/drawable/GradientDrawable$Orientation;->TL_BR:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/graphics/drawable/GradientDrawable$Orientation;->TOP_BOTTOM:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Landroid/graphics/drawable/GradientDrawable$Orientation;->TR_BL:Landroid/graphics/drawable/GradientDrawable$Orientation;

    aput-object v2, v0, v1

    sput-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->$VALUES:[Landroid/graphics/drawable/GradientDrawable$Orientation;

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

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/drawable/GradientDrawable$Orientation;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/drawable/GradientDrawable$Orientation;

    return-object v0
.end method

.method public static values()[Landroid/graphics/drawable/GradientDrawable$Orientation;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/graphics/drawable/GradientDrawable$Orientation;->$VALUES:[Landroid/graphics/drawable/GradientDrawable$Orientation;

    invoke-virtual {v0}, [Landroid/graphics/drawable/GradientDrawable$Orientation;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/drawable/GradientDrawable$Orientation;

    return-object v0
.end method
