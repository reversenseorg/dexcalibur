.class public abstract Landroid/nfc/cardemulation/OffHostApduService;
.super Landroid/app/Service;
.source "OffHostApduService.java"


# static fields
.field public static final SERVICE_INTERFACE:Ljava/lang/String; = "android.nfc.cardemulation.action.OFF_HOST_APDU_SERVICE"

.field public static final SERVICE_META_DATA:Ljava/lang/String; = "android.nfc.cardemulation.off_host_apdu_service"


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
.method public abstract onBind(Landroid/content/Intent;)Landroid/os/IBinder;
.end method
