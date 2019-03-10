.class public Landroid/net/sip/SipSession$State;
.super Ljava/lang/Object;
.source "SipSession.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/net/sip/SipSession;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "State"
.end annotation


# static fields
.field public static final DEREGISTERING:I = 0x2

.field public static final INCOMING_CALL:I = 0x3

.field public static final INCOMING_CALL_ANSWERING:I = 0x4

.field public static final IN_CALL:I = 0x8

.field public static final NOT_DEFINED:I = 0x65

.field public static final OUTGOING_CALL:I = 0x5

.field public static final OUTGOING_CALL_CANCELING:I = 0x7

.field public static final OUTGOING_CALL_RING_BACK:I = 0x6

.field public static final PINGING:I = 0x9

.field public static final READY_TO_CALL:I = 0x0

.field public static final REGISTERING:I = 0x1


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static toString(I)Ljava/lang/String;
    .locals 2
    .param p0, "state"    # I

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
