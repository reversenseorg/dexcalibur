.class public final enum Landroid/graphics/PorterDuff$Mode;
.super Ljava/lang/Enum;
.source "PorterDuff.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/graphics/PorterDuff;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Mode"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/graphics/PorterDuff$Mode;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/graphics/PorterDuff$Mode;

.field public static final enum ADD:Landroid/graphics/PorterDuff$Mode;

.field public static final enum CLEAR:Landroid/graphics/PorterDuff$Mode;

.field public static final enum DARKEN:Landroid/graphics/PorterDuff$Mode;

.field public static final enum DST:Landroid/graphics/PorterDuff$Mode;

.field public static final enum DST_ATOP:Landroid/graphics/PorterDuff$Mode;

.field public static final enum DST_IN:Landroid/graphics/PorterDuff$Mode;

.field public static final enum DST_OUT:Landroid/graphics/PorterDuff$Mode;

.field public static final enum DST_OVER:Landroid/graphics/PorterDuff$Mode;

.field public static final enum LIGHTEN:Landroid/graphics/PorterDuff$Mode;

.field public static final enum MULTIPLY:Landroid/graphics/PorterDuff$Mode;

.field public static final enum OVERLAY:Landroid/graphics/PorterDuff$Mode;

.field public static final enum SCREEN:Landroid/graphics/PorterDuff$Mode;

.field public static final enum SRC:Landroid/graphics/PorterDuff$Mode;

.field public static final enum SRC_ATOP:Landroid/graphics/PorterDuff$Mode;

.field public static final enum SRC_IN:Landroid/graphics/PorterDuff$Mode;

.field public static final enum SRC_OUT:Landroid/graphics/PorterDuff$Mode;

.field public static final enum SRC_OVER:Landroid/graphics/PorterDuff$Mode;

.field public static final enum XOR:Landroid/graphics/PorterDuff$Mode;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 6
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "ADD"

    invoke-direct {v0, v1, v3}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->ADD:Landroid/graphics/PorterDuff$Mode;

    .line 7
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "CLEAR"

    invoke-direct {v0, v1, v4}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->CLEAR:Landroid/graphics/PorterDuff$Mode;

    .line 8
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "DARKEN"

    invoke-direct {v0, v1, v5}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->DARKEN:Landroid/graphics/PorterDuff$Mode;

    .line 9
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "DST"

    invoke-direct {v0, v1, v6}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->DST:Landroid/graphics/PorterDuff$Mode;

    .line 10
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "DST_ATOP"

    invoke-direct {v0, v1, v7}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->DST_ATOP:Landroid/graphics/PorterDuff$Mode;

    .line 11
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "DST_IN"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->DST_IN:Landroid/graphics/PorterDuff$Mode;

    .line 12
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "DST_OUT"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->DST_OUT:Landroid/graphics/PorterDuff$Mode;

    .line 13
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "DST_OVER"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->DST_OVER:Landroid/graphics/PorterDuff$Mode;

    .line 14
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "LIGHTEN"

    const/16 v2, 0x8

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->LIGHTEN:Landroid/graphics/PorterDuff$Mode;

    .line 15
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "MULTIPLY"

    const/16 v2, 0x9

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->MULTIPLY:Landroid/graphics/PorterDuff$Mode;

    .line 16
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "OVERLAY"

    const/16 v2, 0xa

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->OVERLAY:Landroid/graphics/PorterDuff$Mode;

    .line 17
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "SCREEN"

    const/16 v2, 0xb

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->SCREEN:Landroid/graphics/PorterDuff$Mode;

    .line 18
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "SRC"

    const/16 v2, 0xc

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->SRC:Landroid/graphics/PorterDuff$Mode;

    .line 19
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "SRC_ATOP"

    const/16 v2, 0xd

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->SRC_ATOP:Landroid/graphics/PorterDuff$Mode;

    .line 20
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "SRC_IN"

    const/16 v2, 0xe

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->SRC_IN:Landroid/graphics/PorterDuff$Mode;

    .line 21
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "SRC_OUT"

    const/16 v2, 0xf

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->SRC_OUT:Landroid/graphics/PorterDuff$Mode;

    .line 22
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "SRC_OVER"

    const/16 v2, 0x10

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->SRC_OVER:Landroid/graphics/PorterDuff$Mode;

    .line 23
    new-instance v0, Landroid/graphics/PorterDuff$Mode;

    const-string v1, "XOR"

    const/16 v2, 0x11

    invoke-direct {v0, v1, v2}, Landroid/graphics/PorterDuff$Mode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->XOR:Landroid/graphics/PorterDuff$Mode;

    .line 4
    const/16 v0, 0x12

    new-array v0, v0, [Landroid/graphics/PorterDuff$Mode;

    sget-object v1, Landroid/graphics/PorterDuff$Mode;->ADD:Landroid/graphics/PorterDuff$Mode;

    aput-object v1, v0, v3

    sget-object v1, Landroid/graphics/PorterDuff$Mode;->CLEAR:Landroid/graphics/PorterDuff$Mode;

    aput-object v1, v0, v4

    sget-object v1, Landroid/graphics/PorterDuff$Mode;->DARKEN:Landroid/graphics/PorterDuff$Mode;

    aput-object v1, v0, v5

    sget-object v1, Landroid/graphics/PorterDuff$Mode;->DST:Landroid/graphics/PorterDuff$Mode;

    aput-object v1, v0, v6

    sget-object v1, Landroid/graphics/PorterDuff$Mode;->DST_ATOP:Landroid/graphics/PorterDuff$Mode;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->DST_IN:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->DST_OUT:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->DST_OVER:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0x8

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->LIGHTEN:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0x9

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->MULTIPLY:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0xa

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->OVERLAY:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0xb

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->SCREEN:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0xc

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->SRC:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0xd

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->SRC_ATOP:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0xe

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->SRC_IN:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0xf

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->SRC_OUT:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0x10

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->SRC_OVER:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    const/16 v1, 0x11

    sget-object v2, Landroid/graphics/PorterDuff$Mode;->XOR:Landroid/graphics/PorterDuff$Mode;

    aput-object v2, v0, v1

    sput-object v0, Landroid/graphics/PorterDuff$Mode;->$VALUES:[Landroid/graphics/PorterDuff$Mode;

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

.method public static valueOf(Ljava/lang/String;)Landroid/graphics/PorterDuff$Mode;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/graphics/PorterDuff$Mode;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/graphics/PorterDuff$Mode;

    return-object v0
.end method

.method public static values()[Landroid/graphics/PorterDuff$Mode;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/graphics/PorterDuff$Mode;->$VALUES:[Landroid/graphics/PorterDuff$Mode;

    invoke-virtual {v0}, [Landroid/graphics/PorterDuff$Mode;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/graphics/PorterDuff$Mode;

    return-object v0
.end method
