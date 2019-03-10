.class public final enum Landroid/graphics/Matrix$ScaleToFit;
.super Ljava/lang/Enum;
.source "Matrix.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/Matrix;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "ScaleToFit"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/Matrix$ScaleToFit;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/Matrix$ScaleToFit;

.field public static final enum CENTER:Landroid/graphics/Matrix$ScaleToFit;

.field public static final enum END:Landroid/graphics/Matrix$ScaleToFit;

.field public static final enum FILL:Landroid/graphics/Matrix$ScaleToFit;

.field public static final enum START:Landroid/graphics/Matrix$ScaleToFit;


# direct methods
.method static constructor <clinit>()V
    .locals 6

    .prologue
    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Landroid/graphics/Matrix$ScaleToFit;

    const-string v1, "CENTER"

    invoke-direct {v0, v1, v2}, Landroid/graphics/Matrix$ScaleToFit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Matrix$ScaleToFit;->CENTER:Landroid/graphics/Matrix$ScaleToFit;

    .line 7
    new-instance v0, Landroid/graphics/Matrix$ScaleToFit;

    const-string v1, "END"

    invoke-direct {v0, v1, v3}, Landroid/graphics/Matrix$ScaleToFit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Matrix$ScaleToFit;->END:Landroid/graphics/Matrix$ScaleToFit;

    .line 8
    new-instance v0, Landroid/graphics/Matrix$ScaleToFit;

    const-string v1, "FILL"

    invoke-direct {v0, v1, v4}, Landroid/graphics/Matrix$ScaleToFit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Matrix$ScaleToFit;->FILL:Landroid/graphics/Matrix$ScaleToFit;

    .line 9
    new-instance v0, Landroid/graphics/Matrix$ScaleToFit;

    const-string v1, "START"

    invoke-direct {v0, v1, v5}, Landroid/graphics/Matrix$ScaleToFit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Matrix$ScaleToFit;->START:Landroid/graphics/Matrix$ScaleToFit;

    .line 4
    const/4 v0, 0x4

    new-array v0, v0, [Landroid/graphics/Matrix$ScaleToFit;

    sget-object v1, Landroid/graphics/Matrix$ScaleToFit;->CENTER:Landroid/graphics/Matrix$ScaleToFit;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/Matrix$ScaleToFit;->END:Landroid/graphics/Matrix$ScaleToFit;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/Matrix$ScaleToFit;->FILL:Landroid/graphics/Matrix$ScaleToFit;

    aput-object v1, v0, v4

    sget-object v1, Landroid/graphics/Matrix$ScaleToFit;->START:Landroid/graphics/Matrix$ScaleToFit;

    aput-object v1, v0, v5

    sput-object v0, Landroid/graphics/Matrix$ScaleToFit;->$VALUES:[Landroid/graphics/Matrix$ScaleToFit;

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

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/Matrix$ScaleToFit;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/graphics/Matrix$ScaleToFit;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/Matrix$ScaleToFit;

    return-object v0
.end method

.method public static values()[Landroid/graphics/Matrix$ScaleToFit;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/graphics/Matrix$ScaleToFit;->$VALUES:[Landroid/graphics/Matrix$ScaleToFit;

    invoke-virtual {v0}, [Landroid/graphics/Matrix$ScaleToFit;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/Matrix$ScaleToFit;

    return-object v0
.end method
