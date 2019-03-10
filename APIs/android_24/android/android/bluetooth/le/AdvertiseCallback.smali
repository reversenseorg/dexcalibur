.class public abstract Landroid/bluetooth/le/AdvertiseCallback;
.super Ljava/lang/Object;
.source "AdvertiseCallback.java"


# static fields
.field public static final ADVERTISE_FAILED_ALREADY_STARTED:I = 0x3

.field public static final ADVERTISE_FAILED_DATA_TOO_LARGE:I = 0x1

.field public static final ADVERTISE_FAILED_FEATURE_UNSUPPORTED:I = 0x5

.field public static final ADVERTISE_FAILED_INTERNAL_ERROR:I = 0x4

.field public static final ADVERTISE_FAILED_TOO_MANY_ADVERTISERS:I = 0x2


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public onStartFailure(I)V
    .locals 2
    .param p1, "errorCode"    # I

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public onStartSuccess(Landroid/bluetooth/le/AdvertiseSettings;)V
    .locals 2
    .param p1, "settingsInEffect"    # Landroid/bluetooth/le/AdvertiseSettings;

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
