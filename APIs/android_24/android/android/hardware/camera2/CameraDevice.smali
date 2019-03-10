.class public abstract Landroid/hardware/camera2/CameraDevice;
.super Ljava/lang/Object;
.source "CameraDevice.java"

# interfaces
.implements Ljava/lang/AutoCloseable;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/hardware/camera2/CameraDevice$StateCallback;
    }
.end annotation


# static fields
.field public static final TEMPLATE_MANUAL:I = 0x6

.field public static final TEMPLATE_PREVIEW:I = 0x1

.field public static final TEMPLATE_RECORD:I = 0x3

.field public static final TEMPLATE_STILL_CAPTURE:I = 0x2

.field public static final TEMPLATE_VIDEO_SNAPSHOT:I = 0x4

.field public static final TEMPLATE_ZERO_SHUTTER_LAG:I = 0x5


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 18
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract close()V
.end method

.method public abstract createCaptureRequest(I)Landroid/hardware/camera2/CaptureRequest$Builder;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/hardware/camera2/CameraAccessException;
        }
    .end annotation
.end method

.method public abstract createCaptureSession(Ljava/util/List;Landroid/hardware/camera2/CameraCaptureSession$StateCallback;Landroid/os/Handler;)V
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List",
            "<",
            "Landroid/view/Surface;",
            ">;",
            "Landroid/hardware/camera2/CameraCaptureSession$StateCallback;",
            "Landroid/os/Handler;",
            ")V"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/hardware/camera2/CameraAccessException;
        }
    .end annotation
.end method

.method public abstract getId()Ljava/lang/String;
.end method
