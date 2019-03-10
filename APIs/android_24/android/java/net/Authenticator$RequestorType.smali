.class public final enum Ljava/net/Authenticator$RequestorType;
.super Ljava/lang/Enum;
.source "Authenticator.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/net/Authenticator;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "RequestorType"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/net/Authenticator$RequestorType;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/net/Authenticator$RequestorType;

.field public static final enum PROXY:Ljava/net/Authenticator$RequestorType;

.field public static final enum SERVER:Ljava/net/Authenticator$RequestorType;


# direct methods
.method static constructor <clinit>()V
    .locals 4

    .prologue
    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Ljava/net/Authenticator$RequestorType;

    const-string v1, "PROXY"

    invoke-direct {v0, v1, v2}, Ljava/net/Authenticator$RequestorType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/net/Authenticator$RequestorType;->PROXY:Ljava/net/Authenticator$RequestorType;

    .line 7
    new-instance v0, Ljava/net/Authenticator$RequestorType;

    const-string v1, "SERVER"

    invoke-direct {v0, v1, v3}, Ljava/net/Authenticator$RequestorType;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/net/Authenticator$RequestorType;->SERVER:Ljava/net/Authenticator$RequestorType;

    .line 4
    const/4 v0, 0x2

    new-array v0, v0, [Ljava/net/Authenticator$RequestorType;

    sget-object v1, Ljava/net/Authenticator$RequestorType;->PROXY:Ljava/net/Authenticator$RequestorType;

    aput-object v1, v0, v2

    sget-object v1, Ljava/net/Authenticator$RequestorType;->SERVER:Ljava/net/Authenticator$RequestorType;

    aput-object v1, v0, v3

    sput-object v0, Ljava/net/Authenticator$RequestorType;->$VALUES:[Ljava/net/Authenticator$RequestorType;

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

.method public static valueOf(Ljava/lang/String;)Ljava/net/Authenticator$RequestorType;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Ljava/net/Authenticator$RequestorType;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/net/Authenticator$RequestorType;

    return-object v0
.end method

.method public static values()[Ljava/net/Authenticator$RequestorType;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Ljava/net/Authenticator$RequestorType;->$VALUES:[Ljava/net/Authenticator$RequestorType;

    invoke-virtual {v0}, [Ljava/net/Authenticator$RequestorType;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/net/Authenticator$RequestorType;

    return-object v0
.end method
