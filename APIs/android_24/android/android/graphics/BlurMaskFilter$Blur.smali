.class public final enum Landroid/graphics/BlurMaskFilter$Blur;
.super Ljava/lang/Enum;
.source "BlurMaskFilter.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/BlurMaskFilter;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Blur"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/BlurMaskFilter$Blur;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/BlurMaskFilter$Blur;

.field public static final enum INNER:Landroid/graphics/BlurMaskFilter$Blur;

.field public static final enum NORMAL:Landroid/graphics/BlurMaskFilter$Blur;

.field public static final enum OUTER:Landroid/graphics/BlurMaskFilter$Blur;

.field public static final enum SOLID:Landroid/graphics/BlurMaskFilter$Blur;


# direct methods
.method static constructor <clinit>()V
    .locals 6

    .prologue
    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 7
    new-instance v0, Landroid/graphics/BlurMaskFilter$Blur;

    const-string v1, "INNER"

    invoke-direct {v0, v1, v2}, Landroid/graphics/BlurMaskFilter$Blur;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/BlurMaskFilter$Blur;->INNER:Landroid/graphics/BlurMaskFilter$Blur;

    .line 8
    new-instance v0, Landroid/graphics/BlurMaskFilter$Blur;

    const-string v1, "NORMAL"

    invoke-direct {v0, v1, v3}, Landroid/graphics/BlurMaskFilter$Blur;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/BlurMaskFilter$Blur;->NORMAL:Landroid/graphics/BlurMaskFilter$Blur;

    .line 9
    new-instance v0, Landroid/graphics/BlurMaskFilter$Blur;

    const-string v1, "OUTER"

    invoke-direct {v0, v1, v4}, Landroid/graphics/BlurMaskFilter$Blur;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/BlurMaskFilter$Blur;->OUTER:Landroid/graphics/BlurMaskFilter$Blur;

    .line 10
    new-instance v0, Landroid/graphics/BlurMaskFilter$Blur;

    const-string v1, "SOLID"

    invoke-direct {v0, v1, v5}, Landroid/graphics/BlurMaskFilter$Blur;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/BlurMaskFilter$Blur;->SOLID:Landroid/graphics/BlurMaskFilter$Blur;

    .line 5
    const/4 v0, 0x4

    new-array v0, v0, [Landroid/graphics/BlurMaskFilter$Blur;

    sget-object v1, Landroid/graphics/BlurMaskFilter$Blur;->INNER:Landroid/graphics/BlurMaskFilter$Blur;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/BlurMaskFilter$Blur;->NORMAL:Landroid/graphics/BlurMaskFilter$Blur;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/BlurMaskFilter$Blur;->OUTER:Landroid/graphics/BlurMaskFilter$Blur;

    aput-object v1, v0, v4

    sget-object v1, Landroid/graphics/BlurMaskFilter$Blur;->SOLID:Landroid/graphics/BlurMaskFilter$Blur;

    aput-object v1, v0, v5

    sput-object v0, Landroid/graphics/BlurMaskFilter$Blur;->$VALUES:[Landroid/graphics/BlurMaskFilter$Blur;

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

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/BlurMaskFilter$Blur;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/graphics/BlurMaskFilter$Blur;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/BlurMaskFilter$Blur;

    return-object v0
.end method

.method public static values()[Landroid/graphics/BlurMaskFilter$Blur;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/graphics/BlurMaskFilter$Blur;->$VALUES:[Landroid/graphics/BlurMaskFilter$Blur;

    invoke-virtual {v0}, [Landroid/graphics/BlurMaskFilter$Blur;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/BlurMaskFilter$Blur;

    return-object v0
.end method
