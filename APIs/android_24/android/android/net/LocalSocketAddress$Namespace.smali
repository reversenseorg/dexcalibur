.class public final enum Landroid/net/LocalSocketAddress$Namespace;
.super Ljava/lang/Enum;
.source "LocalSocketAddress.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/net/LocalSocketAddress;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Namespace"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/net/LocalSocketAddress$Namespace;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/net/LocalSocketAddress$Namespace;

.field public static final enum ABSTRACT:Landroid/net/LocalSocketAddress$Namespace;

.field public static final enum FILESYSTEM:Landroid/net/LocalSocketAddress$Namespace;

.field public static final enum RESERVED:Landroid/net/LocalSocketAddress$Namespace;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Landroid/net/LocalSocketAddress$Namespace;

    const-string v1, "ABSTRACT"

    invoke-direct {v0, v1, v2}, Landroid/net/LocalSocketAddress$Namespace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/LocalSocketAddress$Namespace;->ABSTRACT:Landroid/net/LocalSocketAddress$Namespace;

    .line 7
    new-instance v0, Landroid/net/LocalSocketAddress$Namespace;

    const-string v1, "FILESYSTEM"

    invoke-direct {v0, v1, v3}, Landroid/net/LocalSocketAddress$Namespace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/LocalSocketAddress$Namespace;->FILESYSTEM:Landroid/net/LocalSocketAddress$Namespace;

    .line 8
    new-instance v0, Landroid/net/LocalSocketAddress$Namespace;

    const-string v1, "RESERVED"

    invoke-direct {v0, v1, v4}, Landroid/net/LocalSocketAddress$Namespace;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/net/LocalSocketAddress$Namespace;->RESERVED:Landroid/net/LocalSocketAddress$Namespace;

    .line 4
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/net/LocalSocketAddress$Namespace;

    sget-object v1, Landroid/net/LocalSocketAddress$Namespace;->ABSTRACT:Landroid/net/LocalSocketAddress$Namespace;

    aput-object v1, v0, v2

    sget-object v1, Landroid/net/LocalSocketAddress$Namespace;->FILESYSTEM:Landroid/net/LocalSocketAddress$Namespace;

    aput-object v1, v0, v3

    sget-object v1, Landroid/net/LocalSocketAddress$Namespace;->RESERVED:Landroid/net/LocalSocketAddress$Namespace;

    aput-object v1, v0, v4

    sput-object v0, Landroid/net/LocalSocketAddress$Namespace;->$VALUES:[Landroid/net/LocalSocketAddress$Namespace;

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

.method public static valueOf(Ljava/lang/String;)Landroid/net/LocalSocketAddress$Namespace;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/net/LocalSocketAddress$Namespace;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/net/LocalSocketAddress$Namespace;

    return-object v0
.end method

.method public static values()[Landroid/net/LocalSocketAddress$Namespace;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/net/LocalSocketAddress$Namespace;->$VALUES:[Landroid/net/LocalSocketAddress$Namespace;

    invoke-virtual {v0}, [Landroid/net/LocalSocketAddress$Namespace;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/net/LocalSocketAddress$Namespace;

    return-object v0
.end method
