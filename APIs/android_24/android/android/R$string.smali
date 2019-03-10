.class public final Landroid/R$string;
.super Ljava/lang/Object;
.source "R.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/R;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "string"
.end annotation


# static fields
.field public static final VideoView_error_button:I = 0x1040010

.field public static final VideoView_error_text_invalid_progressive_playback:I = 0x1040015

.field public static final VideoView_error_text_unknown:I = 0x1040011

.field public static final VideoView_error_title:I = 0x1040012

.field public static final cancel:I = 0x1040000

.field public static final copy:I = 0x1040001

.field public static final copyUrl:I = 0x1040002

.field public static final cut:I = 0x1040003

.field public static final defaultMsisdnAlphaTag:I = 0x1040005

.field public static final defaultVoiceMailAlphaTag:I = 0x1040004

.field public static final dialog_alert_title:I = 0x1040014

.field public static final emptyPhoneNumber:I = 0x1040006

.field public static final httpErrorBadUrl:I = 0x1040007

.field public static final httpErrorUnsupportedScheme:I = 0x1040008

.field public static final no:I = 0x1040009

.field public static final ok:I = 0x104000a

.field public static final paste:I = 0x104000b

.field public static final search_go:I = 0x104000c

.field public static final selectAll:I = 0x104000d

.field public static final selectTextMode:I = 0x1040016

.field public static final status_bar_notification_info_overflow:I = 0x1040017

.field public static final unknownName:I = 0x104000e

.field public static final untitled:I = 0x104000f

.field public static final yes:I = 0x1040013


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 1618
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
