.class public Landroid/bluetooth/BluetoothClass$Device;
.super Ljava/lang/Object;
.source "BluetoothClass.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/bluetooth/BluetoothClass;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "Device"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/bluetooth/BluetoothClass$Device$Major;
    }
.end annotation


# static fields
.field public static final AUDIO_VIDEO_CAMCORDER:I = 0x434

.field public static final AUDIO_VIDEO_CAR_AUDIO:I = 0x420

.field public static final AUDIO_VIDEO_HANDSFREE:I = 0x408

.field public static final AUDIO_VIDEO_HEADPHONES:I = 0x418

.field public static final AUDIO_VIDEO_HIFI_AUDIO:I = 0x428

.field public static final AUDIO_VIDEO_LOUDSPEAKER:I = 0x414

.field public static final AUDIO_VIDEO_MICROPHONE:I = 0x410

.field public static final AUDIO_VIDEO_PORTABLE_AUDIO:I = 0x41c

.field public static final AUDIO_VIDEO_SET_TOP_BOX:I = 0x424

.field public static final AUDIO_VIDEO_UNCATEGORIZED:I = 0x400

.field public static final AUDIO_VIDEO_VCR:I = 0x42c

.field public static final AUDIO_VIDEO_VIDEO_CAMERA:I = 0x430

.field public static final AUDIO_VIDEO_VIDEO_CONFERENCING:I = 0x440

.field public static final AUDIO_VIDEO_VIDEO_DISPLAY_AND_LOUDSPEAKER:I = 0x43c

.field public static final AUDIO_VIDEO_VIDEO_GAMING_TOY:I = 0x448

.field public static final AUDIO_VIDEO_VIDEO_MONITOR:I = 0x438

.field public static final AUDIO_VIDEO_WEARABLE_HEADSET:I = 0x404

.field public static final COMPUTER_DESKTOP:I = 0x104

.field public static final COMPUTER_HANDHELD_PC_PDA:I = 0x110

.field public static final COMPUTER_LAPTOP:I = 0x10c

.field public static final COMPUTER_PALM_SIZE_PC_PDA:I = 0x114

.field public static final COMPUTER_SERVER:I = 0x108

.field public static final COMPUTER_UNCATEGORIZED:I = 0x100

.field public static final COMPUTER_WEARABLE:I = 0x118

.field public static final HEALTH_BLOOD_PRESSURE:I = 0x904

.field public static final HEALTH_DATA_DISPLAY:I = 0x91c

.field public static final HEALTH_GLUCOSE:I = 0x910

.field public static final HEALTH_PULSE_OXIMETER:I = 0x914

.field public static final HEALTH_PULSE_RATE:I = 0x918

.field public static final HEALTH_THERMOMETER:I = 0x908

.field public static final HEALTH_UNCATEGORIZED:I = 0x900

.field public static final HEALTH_WEIGHING:I = 0x90c

.field public static final PHONE_CELLULAR:I = 0x204

.field public static final PHONE_CORDLESS:I = 0x208

.field public static final PHONE_ISDN:I = 0x214

.field public static final PHONE_MODEM_OR_GATEWAY:I = 0x210

.field public static final PHONE_SMART:I = 0x20c

.field public static final PHONE_UNCATEGORIZED:I = 0x200

.field public static final TOY_CONTROLLER:I = 0x810

.field public static final TOY_DOLL_ACTION_FIGURE:I = 0x80c

.field public static final TOY_GAME:I = 0x814

.field public static final TOY_ROBOT:I = 0x804

.field public static final TOY_UNCATEGORIZED:I = 0x800

.field public static final TOY_VEHICLE:I = 0x808

.field public static final WEARABLE_GLASSES:I = 0x714

.field public static final WEARABLE_HELMET:I = 0x710

.field public static final WEARABLE_JACKET:I = 0x70c

.field public static final WEARABLE_PAGER:I = 0x708

.field public static final WEARABLE_UNCATEGORIZED:I = 0x700

.field public static final WEARABLE_WRIST_WATCH:I = 0x704


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 35
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
