.class public interface abstract Landroid/bluetooth/BluetoothProfile;
.super Ljava/lang/Object;
.source "BluetoothProfile.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/bluetooth/BluetoothProfile$ServiceListener;
    }
.end annotation


# static fields
.field public static final A2DP:I = 0x2

.field public static final EXTRA_PREVIOUS_STATE:Ljava/lang/String; = "android.bluetooth.profile.extra.PREVIOUS_STATE"

.field public static final EXTRA_STATE:Ljava/lang/String; = "android.bluetooth.profile.extra.STATE"

.field public static final GATT:I = 0x7

.field public static final GATT_SERVER:I = 0x8

.field public static final HEADSET:I = 0x1

.field public static final HEALTH:I = 0x3

.field public static final STATE_CONNECTED:I = 0x2

.field public static final STATE_CONNECTING:I = 0x1

.field public static final STATE_DISCONNECTED:I = 0x0

.field public static final STATE_DISCONNECTING:I = 0x3


# virtual methods
.method public abstract getConnectedDevices()Ljava/util/List;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List",
            "<",
            "Landroid/bluetooth/BluetoothDevice;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getConnectionState(Landroid/bluetooth/BluetoothDevice;)I
.end method

.method public abstract getDevicesMatchingConnectionStates([I)Ljava/util/List;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "([I)",
            "Ljava/util/List",
            "<",
            "Landroid/bluetooth/BluetoothDevice;",
            ">;"
        }
    .end annotation
.end method
