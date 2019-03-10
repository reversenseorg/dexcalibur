.class public final enum Landroid/webkit/ConsoleMessage$MessageLevel;
.super Ljava/lang/Enum;
.source "ConsoleMessage.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/webkit/ConsoleMessage;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "MessageLevel"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/webkit/ConsoleMessage$MessageLevel;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/webkit/ConsoleMessage$MessageLevel;

.field public static final enum DEBUG:Landroid/webkit/ConsoleMessage$MessageLevel;

.field public static final enum ERROR:Landroid/webkit/ConsoleMessage$MessageLevel;

.field public static final enum LOG:Landroid/webkit/ConsoleMessage$MessageLevel;

.field public static final enum TIP:Landroid/webkit/ConsoleMessage$MessageLevel;

.field public static final enum WARNING:Landroid/webkit/ConsoleMessage$MessageLevel;


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
    new-instance v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    const-string v1, "DEBUG"

    invoke-direct {v0, v1, v2}, Landroid/webkit/ConsoleMessage$MessageLevel;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->DEBUG:Landroid/webkit/ConsoleMessage$MessageLevel;

    .line 7
    new-instance v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    const-string v1, "ERROR"

    invoke-direct {v0, v1, v3}, Landroid/webkit/ConsoleMessage$MessageLevel;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->ERROR:Landroid/webkit/ConsoleMessage$MessageLevel;

    .line 8
    new-instance v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    const-string v1, "LOG"

    invoke-direct {v0, v1, v4}, Landroid/webkit/ConsoleMessage$MessageLevel;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->LOG:Landroid/webkit/ConsoleMessage$MessageLevel;

    .line 9
    new-instance v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    const-string v1, "TIP"

    invoke-direct {v0, v1, v5}, Landroid/webkit/ConsoleMessage$MessageLevel;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->TIP:Landroid/webkit/ConsoleMessage$MessageLevel;

    .line 10
    new-instance v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    const-string v1, "WARNING"

    invoke-direct {v0, v1, v6}, Landroid/webkit/ConsoleMessage$MessageLevel;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->WARNING:Landroid/webkit/ConsoleMessage$MessageLevel;

    .line 4
    const/4 v0, 0x5

    new-array v0, v0, [Landroid/webkit/ConsoleMessage$MessageLevel;

    sget-object v1, Landroid/webkit/ConsoleMessage$MessageLevel;->DEBUG:Landroid/webkit/ConsoleMessage$MessageLevel;

    aput-object v1, v0, v2

    sget-object v1, Landroid/webkit/ConsoleMessage$MessageLevel;->ERROR:Landroid/webkit/ConsoleMessage$MessageLevel;

    aput-object v1, v0, v3

    sget-object v1, Landroid/webkit/ConsoleMessage$MessageLevel;->LOG:Landroid/webkit/ConsoleMessage$MessageLevel;

    aput-object v1, v0, v4

    sget-object v1, Landroid/webkit/ConsoleMessage$MessageLevel;->TIP:Landroid/webkit/ConsoleMessage$MessageLevel;

    aput-object v1, v0, v5

    sget-object v1, Landroid/webkit/ConsoleMessage$MessageLevel;->WARNING:Landroid/webkit/ConsoleMessage$MessageLevel;

    aput-object v1, v0, v6

    sput-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->$VALUES:[Landroid/webkit/ConsoleMessage$MessageLevel;

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

.method public static valueOf(Ljava/lang/String;)Landroid/webkit/ConsoleMessage$MessageLevel;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/webkit/ConsoleMessage$MessageLevel;

    return-object v0
.end method

.method public static values()[Landroid/webkit/ConsoleMessage$MessageLevel;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/webkit/ConsoleMessage$MessageLevel;->$VALUES:[Landroid/webkit/ConsoleMessage$MessageLevel;

    invoke-virtual {v0}, [Landroid/webkit/ConsoleMessage$MessageLevel;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/webkit/ConsoleMessage$MessageLevel;

    return-object v0
.end method
