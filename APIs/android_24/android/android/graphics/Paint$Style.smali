.class public final enum Landroid/graphics/Paint$Style;
.super Ljava/lang/Enum;
.source "Paint.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/Paint;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Style"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/Paint$Style;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/Paint$Style;

.field public static final enum FILL:Landroid/graphics/Paint$Style;

.field public static final enum FILL_AND_STROKE:Landroid/graphics/Paint$Style;

.field public static final enum STROKE:Landroid/graphics/Paint$Style;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Landroid/graphics/Paint$Style;

    const-string v1, "FILL"

    invoke-direct {v0, v1, v2}, Landroid/graphics/Paint$Style;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Style;->FILL:Landroid/graphics/Paint$Style;

    .line 7
    new-instance v0, Landroid/graphics/Paint$Style;

    const-string v1, "FILL_AND_STROKE"

    invoke-direct {v0, v1, v3}, Landroid/graphics/Paint$Style;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Style;->FILL_AND_STROKE:Landroid/graphics/Paint$Style;

    .line 8
    new-instance v0, Landroid/graphics/Paint$Style;

    const-string v1, "STROKE"

    invoke-direct {v0, v1, v4}, Landroid/graphics/Paint$Style;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Style;->STROKE:Landroid/graphics/Paint$Style;

    .line 4
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/graphics/Paint$Style;

    sget-object v1, Landroid/graphics/Paint$Style;->FILL:Landroid/graphics/Paint$Style;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/Paint$Style;->FILL_AND_STROKE:Landroid/graphics/Paint$Style;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/Paint$Style;->STROKE:Landroid/graphics/Paint$Style;

    aput-object v1, v0, v4

    sput-object v0, Landroid/graphics/Paint$Style;->$VALUES:[Landroid/graphics/Paint$Style;

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

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/Paint$Style;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/graphics/Paint$Style;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/Paint$Style;

    return-object v0
.end method

.method public static values()[Landroid/graphics/Paint$Style;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/graphics/Paint$Style;->$VALUES:[Landroid/graphics/Paint$Style;

    invoke-virtual {v0}, [Landroid/graphics/Paint$Style;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/Paint$Style;

    return-object v0
.end method
