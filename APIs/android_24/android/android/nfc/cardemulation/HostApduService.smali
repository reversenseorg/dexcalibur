.class public abstract Landroid/nfc/cardemulation/HostApduService;
.super Landroid/app/Service;
.source "HostApduService.java"


# static fields
.field public static final DEACTIVATION_DESELECTED:I = 0x1

.field public static final DEACTIVATION_LINK_LOSS:I = 0x0

.field public static final SERVICE_INTERFACE:Ljava/lang/String; = "android.nfc.cardemulation.action.HOST_APDU_SERVICE"

.field public static final SERVICE_META_DATA:Ljava/lang/String; = "android.nfc.cardemulation.host_apdu_service"


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/app/Service;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public final notifyUnhandled()V
    .locals 2

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final onBind(Landroid/content/Intent;)Landroid/os/IBinder;
    .locals 2
    .param p1, "intent"    # Landroid/content/Intent;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract onDeactivated(I)V
.end method

.method public abstract processCommandApdu([BLandroid/os/Bundle;)[B
.end method

.method public final sendResponseApdu([B)V
    .locals 2
    .param p1, "responseApdu"    # [B

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
