.class public final enum Landroid/net/wifi/SupplicantState;
.super Ljava/lang/Enum;
.source "SupplicantState.java"

# interfaces
.implements Landroid/os/Parcelable;


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/net/wifi/SupplicantState;",
        ">;",
        "Landroid/os/Parcelable;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/net/wifi/SupplicantState;

.field public static final enum ASSOCIATED:Landroid/net/wifi/SupplicantState;

.field public static final enum ASSOCIATING:Landroid/net/wifi/SupplicantState;

.field public static final enum AUTHENTICATING:Landroid/net/wifi/SupplicantState;

.field public static final enum COMPLETED:Landroid/net/wifi/SupplicantState;

.field public static final enum DISCONNECTED:Landroid/net/wifi/SupplicantState;

.field public static final enum DORMANT:Landroid/net/wifi/SupplicantState;

.field public static final enum FOUR_WAY_HANDSHAKE:Landroid/net/wifi/SupplicantState;

.field public static final enum GROUP_HANDSHAKE:Landroid/net/wifi/SupplicantState;

.field public static final enum INACTIVE:Landroid/net/wifi/SupplicantState;

.field public static final enum INTERFACE_DISABLED:Landroid/net/wifi/SupplicantState;

.field public static final enum INVALID:Landroid/net/wifi/SupplicantState;

.field public static final enum SCANNING:Landroid/net/wifi/SupplicantState;

.field public static final enum UNINITIALIZED:Landroid/net/wifi/SupplicantState;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 5
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "ASSOCIATED"

    invoke-direct {v0, v1, v3}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->ASSOCIATED:Landroid/net/wifi/SupplicantState;

    .line 6
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "ASSOCIATING"

    invoke-direct {v0, v1, v4}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->ASSOCIATING:Landroid/net/wifi/SupplicantState;

    .line 7
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "AUTHENTICATING"

    invoke-direct {v0, v1, v5}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->AUTHENTICATING:Landroid/net/wifi/SupplicantState;

    .line 8
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "COMPLETED"

    invoke-direct {v0, v1, v6}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->COMPLETED:Landroid/net/wifi/SupplicantState;

    .line 9
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "DISCONNECTED"

    invoke-direct {v0, v1, v7}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->DISCONNECTED:Landroid/net/wifi/SupplicantState;

    .line 10
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "DORMANT"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->DORMANT:Landroid/net/wifi/SupplicantState;

    .line 11
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "FOUR_WAY_HANDSHAKE"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->FOUR_WAY_HANDSHAKE:Landroid/net/wifi/SupplicantState;

    .line 12
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "GROUP_HANDSHAKE"

    const/4 v2, 0x7

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->GROUP_HANDSHAKE:Landroid/net/wifi/SupplicantState;

    .line 13
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "INACTIVE"

    const/16 v2, 0x8

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->INACTIVE:Landroid/net/wifi/SupplicantState;

    .line 14
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "INTERFACE_DISABLED"

    const/16 v2, 0x9

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->INTERFACE_DISABLED:Landroid/net/wifi/SupplicantState;

    .line 15
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "INVALID"

    const/16 v2, 0xa

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->INVALID:Landroid/net/wifi/SupplicantState;

    .line 16
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "SCANNING"

    const/16 v2, 0xb

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->SCANNING:Landroid/net/wifi/SupplicantState;

    .line 17
    new-instance v0, Landroid/net/wifi/SupplicantState;

    const-string v1, "UNINITIALIZED"

    const/16 v2, 0xc

    invoke-direct {v0, v1, v2}, Landroid/net/wifi/SupplicantState;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/wifi/SupplicantState;->UNINITIALIZED:Landroid/net/wifi/SupplicantState;

    .line 2
    const/16 v0, 0xd

    new-array v0, v0, [Landroid/net/wifi/SupplicantState;

    sget-object v1, Landroid/net/wifi/SupplicantState;->ASSOCIATED:Landroid/net/wifi/SupplicantState;

    aput-object v1, v0, v3

    sget-object v1, Landroid/net/wifi/SupplicantState;->ASSOCIATING:Landroid/net/wifi/SupplicantState;

    aput-object v1, v0, v4

    sget-object v1, Landroid/net/wifi/SupplicantState;->AUTHENTICATING:Landroid/net/wifi/SupplicantState;

    aput-object v1, v0, v5

    sget-object v1, Landroid/net/wifi/SupplicantState;->COMPLETED:Landroid/net/wifi/SupplicantState;

    aput-object v1, v0, v6

    sget-object v1, Landroid/net/wifi/SupplicantState;->DISCONNECTED:Landroid/net/wifi/SupplicantState;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Landroid/net/wifi/SupplicantState;->DORMANT:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Landroid/net/wifi/SupplicantState;->FOUR_WAY_HANDSHAKE:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/4 v1, 0x7

    sget-object v2, Landroid/net/wifi/SupplicantState;->GROUP_HANDSHAKE:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/16 v1, 0x8

    sget-object v2, Landroid/net/wifi/SupplicantState;->INACTIVE:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/16 v1, 0x9

    sget-object v2, Landroid/net/wifi/SupplicantState;->INTERFACE_DISABLED:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/16 v1, 0xa

    sget-object v2, Landroid/net/wifi/SupplicantState;->INVALID:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/16 v1, 0xb

    sget-object v2, Landroid/net/wifi/SupplicantState;->SCANNING:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    const/16 v1, 0xc

    sget-object v2, Landroid/net/wifi/SupplicantState;->UNINITIALIZED:Landroid/net/wifi/SupplicantState;

    aput-object v2, v0, v1

    sput-object v0, Landroid/net/wifi/SupplicantState;->$VALUES:[Landroid/net/wifi/SupplicantState;

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

.method public static isValidState(Landroid/net/wifi/SupplicantState;)Z
    .locals 2
    .param p0, "state"    # Landroid/net/wifi/SupplicantState;

    .prologue
    .line 18
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/net/wifi/SupplicantState;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 2
    const-class v0, Landroid/net/wifi/SupplicantState;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/net/wifi/SupplicantState;

    return-object v0
.end method

.method public static values()[Landroid/net/wifi/SupplicantState;
    .locals 1

    .prologue
    .line 2
    sget-object v0, Landroid/net/wifi/SupplicantState;->$VALUES:[Landroid/net/wifi/SupplicantState;

    invoke-virtual {v0}, [Landroid/net/wifi/SupplicantState;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/net/wifi/SupplicantState;

    return-object v0
.end method


# virtual methods
.method public describeContents()I
    .locals 2

    .prologue
    .line 19
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public writeToParcel(Landroid/os/Parcel;I)V
    .locals 2
    .param p1, "dest"    # Landroid/os/Parcel;
    .param p2, "flags"    # I

    .prologue
    .line 20
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
