.class public final Landroid/provider/AlarmClock;
.super Ljava/lang/Object;
.source "AlarmClock.java"


# static fields
.field public static final ACTION_SET_ALARM:Ljava/lang/String; = "android.intent.action.SET_ALARM"

.field public static final ACTION_SET_TIMER:Ljava/lang/String; = "android.intent.action.SET_TIMER"

.field public static final ACTION_SHOW_ALARMS:Ljava/lang/String; = "android.intent.action.SHOW_ALARMS"

.field public static final EXTRA_DAYS:Ljava/lang/String; = "android.intent.extra.alarm.DAYS"

.field public static final EXTRA_HOUR:Ljava/lang/String; = "android.intent.extra.alarm.HOUR"

.field public static final EXTRA_LENGTH:Ljava/lang/String; = "android.intent.extra.alarm.LENGTH"

.field public static final EXTRA_MESSAGE:Ljava/lang/String; = "android.intent.extra.alarm.MESSAGE"

.field public static final EXTRA_MINUTES:Ljava/lang/String; = "android.intent.extra.alarm.MINUTES"

.field public static final EXTRA_RINGTONE:Ljava/lang/String; = "android.intent.extra.alarm.RINGTONE"

.field public static final EXTRA_SKIP_UI:Ljava/lang/String; = "android.intent.extra.alarm.SKIP_UI"

.field public static final EXTRA_VIBRATE:Ljava/lang/String; = "android.intent.extra.alarm.VIBRATE"

.field public static final VALUE_RINGTONE_SILENT:Ljava/lang/String; = "silent"


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
