.class public final enum Ljava/math/RoundingMode;
.super Ljava/lang/Enum;
.source "RoundingMode.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/math/RoundingMode;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/math/RoundingMode;

.field public static final enum CEILING:Ljava/math/RoundingMode;

.field public static final enum DOWN:Ljava/math/RoundingMode;

.field public static final enum FLOOR:Ljava/math/RoundingMode;

.field public static final enum HALF_DOWN:Ljava/math/RoundingMode;

.field public static final enum HALF_EVEN:Ljava/math/RoundingMode;

.field public static final enum HALF_UP:Ljava/math/RoundingMode;

.field public static final enum UNNECESSARY:Ljava/math/RoundingMode;

.field public static final enum UP:Ljava/math/RoundingMode;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 4
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "CEILING"

    invoke-direct {v0, v1, v3}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->CEILING:Ljava/math/RoundingMode;

    .line 5
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "DOWN"

    invoke-direct {v0, v1, v4}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->DOWN:Ljava/math/RoundingMode;

    .line 6
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "FLOOR"

    invoke-direct {v0, v1, v5}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->FLOOR:Ljava/math/RoundingMode;

    .line 7
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "HALF_DOWN"

    invoke-direct {v0, v1, v6}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->HALF_DOWN:Ljava/math/RoundingMode;

    .line 8
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "HALF_EVEN"

    invoke-direct {v0, v1, v7}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->HALF_EVEN:Ljava/math/RoundingMode;

    .line 9
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "HALF_UP"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->HALF_UP:Ljava/math/RoundingMode;

    .line 10
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "UNNECESSARY"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->UNNECESSARY:Ljava/math/RoundingMode;

    .line 11
    new-instance v0, Ljava/math/RoundingMode;

    const-string v1, "UP"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Ljava/math/RoundingMode;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/math/RoundingMode;->UP:Ljava/math/RoundingMode;

    .line 2
    const/16 v0, 0x8

    new-array v0, v0, [Ljava/math/RoundingMode;

    sget-object v1, Ljava/math/RoundingMode;->CEILING:Ljava/math/RoundingMode;

    aput-object v1, v0, v3

    sget-object v1, Ljava/math/RoundingMode;->DOWN:Ljava/math/RoundingMode;

    aput-object v1, v0, v4

    sget-object v1, Ljava/math/RoundingMode;->FLOOR:Ljava/math/RoundingMode;

    aput-object v1, v0, v5

    sget-object v1, Ljava/math/RoundingMode;->HALF_DOWN:Ljava/math/RoundingMode;

    aput-object v1, v0, v6

    sget-object v1, Ljava/math/RoundingMode;->HALF_EVEN:Ljava/math/RoundingMode;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Ljava/math/RoundingMode;->HALF_UP:Ljava/math/RoundingMode;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Ljava/math/RoundingMode;->UNNECESSARY:Ljava/math/RoundingMode;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Ljava/math/RoundingMode;->UP:Ljava/math/RoundingMode;

    aput-object v2, v0, v1

    sput-object v0, Ljava/math/RoundingMode;->$VALUES:[Ljava/math/RoundingMode;

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
    .line 2
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(I)Ljava/math/RoundingMode;
    .locals 2
    .param p0, "mode"    # I

    .prologue
    .line 12
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static valueOf(Ljava/lang/String;)Ljava/math/RoundingMode;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 2
    const-class v0, Ljava/math/RoundingMode;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/math/RoundingMode;

    return-object v0
.end method

.method public static values()[Ljava/math/RoundingMode;
    .locals 1

    .prologue
    .line 2
    sget-object v0, Ljava/math/RoundingMode;->$VALUES:[Ljava/math/RoundingMode;

    invoke-virtual {v0}, [Ljava/math/RoundingMode;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/math/RoundingMode;

    return-object v0
.end method
