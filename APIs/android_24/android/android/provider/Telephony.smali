.class public final Landroid/provider/Telephony;
.super Ljava/lang/Object;
.source "Telephony.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/provider/Telephony$Carriers;,
        Landroid/provider/Telephony$MmsSms;,
        Landroid/provider/Telephony$Mms;,
        Landroid/provider/Telephony$Threads;,
        Landroid/provider/Telephony$ThreadsColumns;,
        Landroid/provider/Telephony$CanonicalAddressesColumns;,
        Landroid/provider/Telephony$BaseMmsColumns;,
        Landroid/provider/Telephony$Sms;,
        Landroid/provider/Telephony$TextBasedSmsColumns;
    }
.end annotation


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 336
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
