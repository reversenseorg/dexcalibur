.class public final enum Landroid/net/NetworkInfo$State;
.super Ljava/lang/Enum;
.source "NetworkInfo.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/net/NetworkInfo;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "State"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/net/NetworkInfo$State;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/net/NetworkInfo$State;

.field public static final enum CONNECTED:Landroid/net/NetworkInfo$State;

.field public static final enum CONNECTING:Landroid/net/NetworkInfo$State;

.field public static final enum DISCONNECTED:Landroid/net/NetworkInfo$State;

.field public static final enum DISCONNECTING:Landroid/net/NetworkInfo$State;

.field public static final enum SUSPENDED:Landroid/net/NetworkInfo$State;

.field public static final enum UNKNOWN:Landroid/net/NetworkInfo$State;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 7
    new-instance v0, Landroid/net/NetworkInfo$State;

    const-string v1, "CONNECTED"

    invoke-direct {v0, v1, v3}, Landroid/net/NetworkInfo$State;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$State;->CONNECTED:Landroid/net/NetworkInfo$State;

    .line 8
    new-instance v0, Landroid/net/NetworkInfo$State;

    const-string v1, "CONNECTING"

    invoke-direct {v0, v1, v4}, Landroid/net/NetworkInfo$State;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$State;->CONNECTING:Landroid/net/NetworkInfo$State;

    .line 9
    new-instance v0, Landroid/net/NetworkInfo$State;

    const-string v1, "DISCONNECTED"

    invoke-direct {v0, v1, v5}, Landroid/net/NetworkInfo$State;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$State;->DISCONNECTED:Landroid/net/NetworkInfo$State;

    .line 10
    new-instance v0, Landroid/net/NetworkInfo$State;

    const-string v1, "DISCONNECTING"

    invoke-direct {v0, v1, v6}, Landroid/net/NetworkInfo$State;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$State;->DISCONNECTING:Landroid/net/NetworkInfo$State;

    .line 11
    new-instance v0, Landroid/net/NetworkInfo$State;

    const-string v1, "SUSPENDED"

    invoke-direct {v0, v1, v7}, Landroid/net/NetworkInfo$State;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$State;->SUSPENDED:Landroid/net/NetworkInfo$State;

    .line 12
    new-instance v0, Landroid/net/NetworkInfo$State;

    const-string v1, "UNKNOWN"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/net/NetworkInfo$State;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/NetworkInfo$State;->UNKNOWN:Landroid/net/NetworkInfo$State;

    .line 5
    const/4 v0, 0x6

    new-array v0, v0, [Landroid/net/NetworkInfo$State;

    sget-object v1, Landroid/net/NetworkInfo$State;->CONNECTED:Landroid/net/NetworkInfo$State;

    aput-object v1, v0, v3

    sget-object v1, Landroid/net/NetworkInfo$State;->CONNECTING:Landroid/net/NetworkInfo$State;

    aput-object v1, v0, v4

    sget-object v1, Landroid/net/NetworkInfo$State;->DISCONNECTED:Landroid/net/NetworkInfo$State;

    aput-object v1, v0, v5

    sget-object v1, Landroid/net/NetworkInfo$State;->DISCONNECTING:Landroid/net/NetworkInfo$State;

    aput-object v1, v0, v6

    sget-object v1, Landroid/net/NetworkInfo$State;->SUSPENDED:Landroid/net/NetworkInfo$State;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/net/NetworkInfo$State;->UNKNOWN:Landroid/net/NetworkInfo$State;

    aput-object v2, v0, v1

    sput-object v0, Landroid/net/NetworkInfo$State;->$VALUES:[Landroid/net/NetworkInfo$State;

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

.method public static valueOf(Ljava/lang/String;)Landroid/net/NetworkInfo$State;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/net/NetworkInfo$State;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/net/NetworkInfo$State;

    return-object v0
.end method

.method public static values()[Landroid/net/NetworkInfo$State;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/net/NetworkInfo$State;->$VALUES:[Landroid/net/NetworkInfo$State;

    invoke-virtual {v0}, [Landroid/net/NetworkInfo$State;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/net/NetworkInfo$State;

    return-object v0
.end method
