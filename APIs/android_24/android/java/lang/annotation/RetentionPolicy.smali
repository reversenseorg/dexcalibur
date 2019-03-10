.class public final enum Ljava/lang/annotation/RetentionPolicy;
.super Ljava/lang/Enum;
.source "RetentionPolicy.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/lang/annotation/RetentionPolicy;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/lang/annotation/RetentionPolicy;

.field public static final enum CLASS:Ljava/lang/annotation/RetentionPolicy;

.field public static final enum RUNTIME:Ljava/lang/annotation/RetentionPolicy;

.field public static final enum SOURCE:Ljava/lang/annotation/RetentionPolicy;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 4
    new-instance v0, Ljava/lang/annotation/RetentionPolicy;

    const-string v1, "CLASS"

    invoke-direct {v0, v1, v2}, Ljava/lang/annotation/RetentionPolicy;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/lang/annotation/RetentionPolicy;->CLASS:Ljava/lang/annotation/RetentionPolicy;

    .line 5
    new-instance v0, Ljava/lang/annotation/RetentionPolicy;

    const-string v1, "RUNTIME"

    invoke-direct {v0, v1, v3}, Ljava/lang/annotation/RetentionPolicy;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/lang/annotation/RetentionPolicy;->RUNTIME:Ljava/lang/annotation/RetentionPolicy;

    .line 6
    new-instance v0, Ljava/lang/annotation/RetentionPolicy;

    const-string v1, "SOURCE"

    invoke-direct {v0, v1, v4}, Ljava/lang/annotation/RetentionPolicy;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/lang/annotation/RetentionPolicy;->SOURCE:Ljava/lang/annotation/RetentionPolicy;

    .line 2
    const/4 v0, 0x3

    new-array v0, v0, [Ljava/lang/annotation/RetentionPolicy;

    sget-object v1, Ljava/lang/annotation/RetentionPolicy;->CLASS:Ljava/lang/annotation/RetentionPolicy;

    aput-object v1, v0, v2

    sget-object v1, Ljava/lang/annotation/RetentionPolicy;->RUNTIME:Ljava/lang/annotation/RetentionPolicy;

    aput-object v1, v0, v3

    sget-object v1, Ljava/lang/annotation/RetentionPolicy;->SOURCE:Ljava/lang/annotation/RetentionPolicy;

    aput-object v1, v0, v4

    sput-object v0, Ljava/lang/annotation/RetentionPolicy;->$VALUES:[Ljava/lang/annotation/RetentionPolicy;

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

.method public static valueOf(Ljava/lang/String;)Ljava/lang/annotation/RetentionPolicy;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 2
    const-class v0, Ljava/lang/annotation/RetentionPolicy;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/lang/annotation/RetentionPolicy;

    return-object v0
.end method

.method public static values()[Ljava/lang/annotation/RetentionPolicy;
    .locals 1

    .prologue
    .line 2
    sget-object v0, Ljava/lang/annotation/RetentionPolicy;->$VALUES:[Ljava/lang/annotation/RetentionPolicy;

    invoke-virtual {v0}, [Ljava/lang/annotation/RetentionPolicy;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/lang/annotation/RetentionPolicy;

    return-object v0
.end method
