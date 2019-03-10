.class public Landroid/os/Build;
.super Ljava/lang/Object;
.source "Build.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/os/Build$VERSION_CODES;,
        Landroid/os/Build$VERSION;
    }
.end annotation


# static fields
.field public static final BOARD:Ljava/lang/String;

.field public static final BOOTLOADER:Ljava/lang/String;

.field public static final BRAND:Ljava/lang/String;

.field public static final CPU_ABI:Ljava/lang/String;
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final CPU_ABI2:Ljava/lang/String;
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final DEVICE:Ljava/lang/String;

.field public static final DISPLAY:Ljava/lang/String;

.field public static final FINGERPRINT:Ljava/lang/String;

.field public static final HARDWARE:Ljava/lang/String;

.field public static final HOST:Ljava/lang/String;

.field public static final ID:Ljava/lang/String;

.field public static final MANUFACTURER:Ljava/lang/String;

.field public static final MODEL:Ljava/lang/String;

.field public static final PRODUCT:Ljava/lang/String;

.field public static final RADIO:Ljava/lang/String;
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SERIAL:Ljava/lang/String;

.field public static final SUPPORTED_32_BIT_ABIS:[Ljava/lang/String;

.field public static final SUPPORTED_64_BIT_ABIS:[Ljava/lang/String;

.field public static final SUPPORTED_ABIS:[Ljava/lang/String;

.field public static final TAGS:Ljava/lang/String;

.field public static final TIME:J

.field public static final TYPE:Ljava/lang/String;

.field public static final UNKNOWN:Ljava/lang/String; = "unknown"

.field public static final USER:Ljava/lang/String;


# direct methods
.method static constructor <clinit>()V
    .locals 3

    .prologue
    const/4 v2, 0x0

    .line 63
    sput-object v2, Landroid/os/Build;->SUPPORTED_32_BIT_ABIS:[Ljava/lang/String;

    .line 64
    sput-object v2, Landroid/os/Build;->SUPPORTED_64_BIT_ABIS:[Ljava/lang/String;

    .line 65
    sput-object v2, Landroid/os/Build;->SUPPORTED_ABIS:[Ljava/lang/String;

    .line 71
    sput-object v2, Landroid/os/Build;->BOARD:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->BOOTLOADER:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->BRAND:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->CPU_ABI:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->CPU_ABI2:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->DEVICE:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->DISPLAY:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->FINGERPRINT:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->HARDWARE:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->HOST:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->ID:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->MANUFACTURER:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->MODEL:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->PRODUCT:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->RADIO:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->SERIAL:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->TAGS:Ljava/lang/String;

    const-wide/16 v0, 0x0

    sput-wide v0, Landroid/os/Build;->TIME:J

    sput-object v2, Landroid/os/Build;->TYPE:Ljava/lang/String;

    sput-object v2, Landroid/os/Build;->USER:Ljava/lang/String;

    return-void
.end method

.method public constructor <init>()V
    .locals 2

    .prologue
    .line 42
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static getRadioVersion()Ljava/lang/String;
    .locals 2

    .prologue
    .line 43
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
