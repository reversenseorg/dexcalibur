.class public final enum Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;
.super Ljava/lang/Enum;
.source "SSLEngineResult.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljavax/net/ssl/SSLEngineResult;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "HandshakeStatus"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

.field public static final enum FINISHED:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

.field public static final enum NEED_TASK:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

.field public static final enum NEED_UNWRAP:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

.field public static final enum NEED_WRAP:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

.field public static final enum NOT_HANDSHAKING:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;


# direct methods
.method static constructor <clinit>()V
    .locals 7

    .prologue
    const/4 v6, 0x4

    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    const-string v1, "FINISHED"

    invoke-direct {v0, v1, v2}, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->FINISHED:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    .line 7
    new-instance v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    const-string v1, "NEED_TASK"

    invoke-direct {v0, v1, v3}, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NEED_TASK:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    .line 8
    new-instance v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    const-string v1, "NEED_UNWRAP"

    invoke-direct {v0, v1, v4}, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NEED_UNWRAP:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    .line 9
    new-instance v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    const-string v1, "NEED_WRAP"

    invoke-direct {v0, v1, v5}, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NEED_WRAP:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    .line 10
    new-instance v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    const-string v1, "NOT_HANDSHAKING"

    invoke-direct {v0, v1, v6}, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NOT_HANDSHAKING:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    .line 4
    const/4 v0, 0x5

    new-array v0, v0, [Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    sget-object v1, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->FINISHED:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    aput-object v1, v0, v2

    sget-object v1, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NEED_TASK:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    aput-object v1, v0, v3

    sget-object v1, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NEED_UNWRAP:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    aput-object v1, v0, v4

    sget-object v1, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NEED_WRAP:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    aput-object v1, v0, v5

    sget-object v1, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->NOT_HANDSHAKING:Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    aput-object v1, v0, v6

    sput-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->$VALUES:[Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

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

.method public static valueOf(Ljava/lang/String;)Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    return-object v0
.end method

.method public static values()[Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->$VALUES:[Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    invoke-virtual {v0}, [Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljavax/net/ssl/SSLEngineResult$HandshakeStatus;

    return-object v0
.end method
