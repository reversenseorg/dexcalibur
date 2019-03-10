.class public final Landroid/hardware/usb/UsbConstants;
.super Ljava/lang/Object;
.source "UsbConstants.java"


# static fields
.field public static final USB_CLASS_APP_SPEC:I = 0xfe

.field public static final USB_CLASS_AUDIO:I = 0x1

.field public static final USB_CLASS_CDC_DATA:I = 0xa

.field public static final USB_CLASS_COMM:I = 0x2

.field public static final USB_CLASS_CONTENT_SEC:I = 0xd

.field public static final USB_CLASS_CSCID:I = 0xb

.field public static final USB_CLASS_HID:I = 0x3

.field public static final USB_CLASS_HUB:I = 0x9

.field public static final USB_CLASS_MASS_STORAGE:I = 0x8

.field public static final USB_CLASS_MISC:I = 0xef

.field public static final USB_CLASS_PER_INTERFACE:I = 0x0

.field public static final USB_CLASS_PHYSICA:I = 0x5

.field public static final USB_CLASS_PRINTER:I = 0x7

.field public static final USB_CLASS_STILL_IMAGE:I = 0x6

.field public static final USB_CLASS_VENDOR_SPEC:I = 0xff

.field public static final USB_CLASS_VIDEO:I = 0xe

.field public static final USB_CLASS_WIRELESS_CONTROLLER:I = 0xe0

.field public static final USB_DIR_IN:I = 0x80

.field public static final USB_DIR_OUT:I = 0x0

.field public static final USB_ENDPOINT_DIR_MASK:I = 0x80

.field public static final USB_ENDPOINT_NUMBER_MASK:I = 0xf

.field public static final USB_ENDPOINT_XFERTYPE_MASK:I = 0x3

.field public static final USB_ENDPOINT_XFER_BULK:I = 0x2

.field public static final USB_ENDPOINT_XFER_CONTROL:I = 0x0

.field public static final USB_ENDPOINT_XFER_INT:I = 0x3

.field public static final USB_ENDPOINT_XFER_ISOC:I = 0x1

.field public static final USB_INTERFACE_SUBCLASS_BOOT:I = 0x1

.field public static final USB_SUBCLASS_VENDOR_SPEC:I = 0xff

.field public static final USB_TYPE_CLASS:I = 0x20

.field public static final USB_TYPE_MASK:I = 0x60

.field public static final USB_TYPE_RESERVED:I = 0x60

.field public static final USB_TYPE_STANDARD:I = 0x0

.field public static final USB_TYPE_VENDOR:I = 0x40


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
