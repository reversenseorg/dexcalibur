.class public final enum Landroid/net/NetworkInfo$DetailedState;
.super Ljava/lang/Enum;
.source "NetworkInfo.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/net/NetworkInfo;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "DetailedState"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/net/NetworkInfo$DetailedState;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/net/NetworkInfo$DetailedState;

.field public static final enum AUTHENTICATING:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum BLOCKED:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum CAPTIVE_PORTAL_CHECK:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum CONNECTED:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum CONNECTING:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum DISCONNECTED:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum DISCONNECTING:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum FAILED:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum IDLE:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum OBTAINING_IPADDR:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum SCANNING:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum SUSPENDED:Landroid/net/NetworkInfo$DetailedState;

.field public static final enum VERIFYING_POOR_LINK:Landroid/net/NetworkInfo$DetailedState;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 16
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "AUTHENTICATING"

    invoke-direct {v0, v1, v3}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->AUTHENTICATING:Landroid/net/NetworkInfo$DetailedState;

    .line 17
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "BLOCKED"

    invoke-direct {v0, v1, v4}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->BLOCKED:Landroid/net/NetworkInfo$DetailedState;

    .line 18
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "CAPTIVE_PORTAL_CHECK"

    invoke-direct {v0, v1, v5}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->CAPTIVE_PORTAL_CHECK:Landroid/net/NetworkInfo$DetailedState;

    .line 19
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "CONNECTED"

    invoke-direct {v0, v1, v6}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->CONNECTED:Landroid/net/NetworkInfo$DetailedState;

    .line 20
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "CONNECTING"

    invoke-direct {v0, v1, v7}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->CONNECTING:Landroid/net/NetworkInfo$DetailedState;

    .line 21
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "DISCONNECTED"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->DISCONNECTED:Landroid/net/NetworkInfo$DetailedState;

    .line 22
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "DISCONNECTING"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->DISCONNECTING:Landroid/net/NetworkInfo$DetailedState;

    .line 23
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "FAILED"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->FAILED:Landroid/net/NetworkInfo$DetailedState;

    .line 24
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "IDLE"

    const/16 v2, 0x8

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->IDLE:Landroid/net/NetworkInfo$DetailedState;

    .line 25
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "OBTAINING_IPADDR"

    const/16 v2, 0x9

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->OBTAINING_IPADDR:Landroid/net/NetworkInfo$DetailedState;

    .line 26
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "SCANNING"

    const/16 v2, 0xa

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->SCANNING:Landroid/net/NetworkInfo$DetailedState;

    .line 27
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "SUSPENDED"

    const/16 v2, 0xb

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->SUSPENDED:Landroid/net/NetworkInfo$DetailedState;

    .line 28
    new-instance v0, Landroid/net/NetworkInfo$DetailedState;

    const-string v1, "VERIFYING_POOR_LINK"

    const/16 v2, 0xc

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$DetailedState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->VERIFYING_POOR_LINK:Landroid/net/NetworkInfo$DetailedState;

    .line 14
    const/16 v0, 0xd

    new-array v0, v0, [Landroid/net/NetworkInfo$DetailedState;

    sget-object v1, Landroid/net/NetworkInfo$DetailedState;->AUTHENTICATING:Landroid/net/NetworkInfo$DetailedState;

    aput-object v1, v0, v3

    sget-object v1, Landroid/net/NetworkInfo$DetailedState;->BLOCKED:Landroid/net/NetworkInfo$DetailedState;

    aput-object v1, v0, v4

    sget-object v1, Landroid/net/NetworkInfo$DetailedState;->CAPTIVE_PORTAL_CHECK:Landroid/net/NetworkInfo$DetailedState;

    aput-object v1, v0, v5

    sget-object v1, Landroid/net/NetworkInfo$DetailedState;->CONNECTED:Landroid/net/NetworkInfo$DetailedState;

    aput-object v1, v0, v6

    sget-object v1, Landroid/net/NetworkInfo$DetailedState;->CONNECTING:Landroid/net/NetworkInfo$DetailedState;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->DISCONNECTED:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->DISCONNECTING:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->FAILED:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/16 v1, 0x8

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->IDLE:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/16 v1, 0x9

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->OBTAINING_IPADDR:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/16 v1, 0xa

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->SCANNING:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/16 v1, 0xb

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->SUSPENDED:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    const/16 v1, 0xc

    sget-object v2, Landroid/net/NetworkInfo$DetailedState;->VERIFYING_POOR_LINK:Landroid/net/NetworkInfo$DetailedState;

    aput-object v2, v0, v1

    sput-object v0, Landroid/net/NetworkInfo$DetailedState;->$VALUES:[Landroid/net/NetworkInfo$DetailedState;

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
    .line 14
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/net/NetworkInfo$DetailedState;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 14
    const-class v0, Landroid/net/NetworkInfo$DetailedState;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/net/NetworkInfo$DetailedState;

    return-object v0
.end method

.method public static values()[Landroid/net/NetworkInfo$DetailedState;
    .locals 1

    .prologue
    .line 14
    sget-object v0, Landroid/net/NetworkInfo$DetailedState;->$VALUES:[Landroid/net/NetworkInfo$DetailedState;

    invoke-virtual {v0}, [Landroid/net/NetworkInfo$DetailedState;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/net/NetworkInfo$DetailedState;

    return-object v0
.end method
