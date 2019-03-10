.class public final enum Landroid/graphics/Paint$Cap;
.super Ljava/lang/Enum;
.source "Paint.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/Paint;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Cap"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/Paint$Cap;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/Paint$Cap;

.field public static final enum BUTT:Landroid/graphics/Paint$Cap;

.field public static final enum ROUND:Landroid/graphics/Paint$Cap;

.field public static final enum SQUARE:Landroid/graphics/Paint$Cap;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 12
    new-instance v0, Landroid/graphics/Paint$Cap;

    const-string v1, "BUTT"

    invoke-direct {v0, v1, v2}, Landroid/graphics/Paint$Cap;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Cap;->BUTT:Landroid/graphics/Paint$Cap;

    .line 13
    new-instance v0, Landroid/graphics/Paint$Cap;

    const-string v1, "ROUND"

    invoke-direct {v0, v1, v3}, Landroid/graphics/Paint$Cap;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Cap;->ROUND:Landroid/graphics/Paint$Cap;

    .line 14
    new-instance v0, Landroid/graphics/Paint$Cap;

    const-string v1, "SQUARE"

    invoke-direct {v0, v1, v4}, Landroid/graphics/Paint$Cap;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Cap;->SQUARE:Landroid/graphics/Paint$Cap;

    .line 10
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/graphics/Paint$Cap;

    sget-object v1, Landroid/graphics/Paint$Cap;->BUTT:Landroid/graphics/Paint$Cap;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/Paint$Cap;->ROUND:Landroid/graphics/Paint$Cap;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/Paint$Cap;->SQUARE:Landroid/graphics/Paint$Cap;

    aput-object v1, v0, v4

    sput-object v0, Landroid/graphics/Paint$Cap;->$VALUES:[Landroid/graphics/Paint$Cap;

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
    .line 10
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/Paint$Cap;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 10
    const-class v0, Landroid/graphics/Paint$Cap;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/Paint$Cap;

    return-object v0
.end method

.method public static values()[Landroid/graphics/Paint$Cap;
    .locals 1

    .prologue
    .line 10
    sget-object v0, Landroid/graphics/Paint$Cap;->$VALUES:[Landroid/graphics/Paint$Cap;

    invoke-virtual {v0}, [Landroid/graphics/Paint$Cap;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/Paint$Cap;

    return-object v0
.end method
