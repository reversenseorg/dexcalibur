.class public final enum Ljava/net/Proxy$Type;
.super Ljava/lang/Enum;
.source "Proxy.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/net/Proxy;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Type"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/net/Proxy$Type;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/net/Proxy$Type;

.field public static final enum DIRECT:Ljava/net/Proxy$Type;

.field public static final enum HTTP:Ljava/net/Proxy$Type;

.field public static final enum SOCKS:Ljava/net/Proxy$Type;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Ljava/net/Proxy$Type;

    const-string v1, "DIRECT"

    invoke-direct {v0, v1, v2}, Ljava/net/Proxy$Type;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/net/Proxy$Type;->DIRECT:Ljava/net/Proxy$Type;

    .line 7
    new-instance v0, Ljava/net/Proxy$Type;

    const-string v1, "HTTP"

    invoke-direct {v0, v1, v3}, Ljava/net/Proxy$Type;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/net/Proxy$Type;->HTTP:Ljava/net/Proxy$Type;

    .line 8
    new-instance v0, Ljava/net/Proxy$Type;

    const-string v1, "SOCKS"

    invoke-direct {v0, v1, v4}, Ljava/net/Proxy$Type;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/net/Proxy$Type;->SOCKS:Ljava/net/Proxy$Type;

    .line 4
    const/4 v0, 0x3

    new-array v0, v0, [Ljava/net/Proxy$Type;

    sget-object v1, Ljava/net/Proxy$Type;->DIRECT:Ljava/net/Proxy$Type;

    aput-object v1, v0, v2

    sget-object v1, Ljava/net/Proxy$Type;->HTTP:Ljava/net/Proxy$Type;

    aput-object v1, v0, v3

    sget-object v1, Ljava/net/Proxy$Type;->SOCKS:Ljava/net/Proxy$Type;

    aput-object v1, v0, v4

    sput-object v0, Ljava/net/Proxy$Type;->$VALUES:[Ljava/net/Proxy$Type;

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

.method public static valueOf(Ljava/lang/String;)Ljava/net/Proxy$Type;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Ljava/net/Proxy$Type;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/net/Proxy$Type;

    return-object v0
.end method

.method public static values()[Ljava/net/Proxy$Type;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Ljava/net/Proxy$Type;->$VALUES:[Ljava/net/Proxy$Type;

    invoke-virtual {v0}, [Ljava/net/Proxy$Type;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/net/Proxy$Type;

    return-object v0
.end method
