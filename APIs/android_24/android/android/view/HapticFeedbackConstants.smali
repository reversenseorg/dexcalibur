.class public Landroid/view/HapticFeedbackConstants;
.super Ljava/lang/Object;
.source "HapticFeedbackConstants.java"


# static fields
.field public static final CLOCK_TICK:I = 0x4

.field public static final FLAG_IGNORE_GLOBAL_SETTING:I = 0x2

.field public static final FLAG_IGNORE_VIEW_SETTING:I = 0x1

.field public static final KEYBOARD_TAP:I = 0x3

.field public static final LONG_PRESS:I = 0x0

.field public static final VIRTUAL_KEY:I = 0x1


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
