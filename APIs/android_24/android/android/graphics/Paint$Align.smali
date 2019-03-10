.class public final enum Landroid/graphics/Paint$Align;
.super Ljava/lang/Enum;
.source "Paint.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/Paint;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Align"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/Paint$Align;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/Paint$Align;

.field public static final enum CENTER:Landroid/graphics/Paint$Align;

.field public static final enum LEFT:Landroid/graphics/Paint$Align;

.field public static final enum RIGHT:Landroid/graphics/Paint$Align;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 24
    new-instance v0, Landroid/graphics/Paint$Align;

    const-string v1, "CENTER"

    invoke-direct {v0, v1, v2}, Landroid/graphics/Paint$Align;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Align;->CENTER:Landroid/graphics/Paint$Align;

    .line 25
    new-instance v0, Landroid/graphics/Paint$Align;

    const-string v1, "LEFT"

    invoke-direct {v0, v1, v3}, Landroid/graphics/Paint$Align;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Align;->LEFT:Landroid/graphics/Paint$Align;

    .line 26
    new-instance v0, Landroid/graphics/Paint$Align;

    const-string v1, "RIGHT"

    invoke-direct {v0, v1, v4}, Landroid/graphics/Paint$Align;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/Paint$Align;->RIGHT:Landroid/graphics/Paint$Align;

    .line 22
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/graphics/Paint$Align;

    sget-object v1, Landroid/graphics/Paint$Align;->CENTER:Landroid/graphics/Paint$Align;

    aput-object v1, v0, v2

    sget-object v1, Landroid/graphics/Paint$Align;->LEFT:Landroid/graphics/Paint$Align;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/Paint$Align;->RIGHT:Landroid/graphics/Paint$Align;

    aput-object v1, v0, v4

    sput-object v0, Landroid/graphics/Paint$Align;->$VALUES:[Landroid/graphics/Paint$Align;

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
    .line 22
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/Paint$Align;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 22
    const-class v0, Landroid/graphics/Paint$Align;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/Paint$Align;

    return-object v0
.end method

.method public static values()[Landroid/graphics/Paint$Align;
    .locals 1

    .prologue
    .line 22
    sget-object v0, Landroid/graphics/Paint$Align;->$VALUES:[Landroid/graphics/Paint$Align;

    invoke-virtual {v0}, [Landroid/graphics/Paint$Align;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/Paint$Align;

    return-object v0
.end method
