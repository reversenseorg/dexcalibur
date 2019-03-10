.class public Landroid/net/sip/SipErrorCode;
.super Ljava/lang/Object;
.source "SipErrorCode.java"


# static fields
.field public static final CLIENT_ERROR:I = -0x4

.field public static final CROSS_DOMAIN_AUTHENTICATION:I = -0xb

.field public static final DATA_CONNECTION_LOST:I = -0xa

.field public static final INVALID_CREDENTIALS:I = -0x8

.field public static final INVALID_REMOTE_URI:I = -0x6

.field public static final IN_PROGRESS:I = -0x9

.field public static final NO_ERROR:I = 0x0

.field public static final PEER_NOT_REACHABLE:I = -0x7

.field public static final SERVER_ERROR:I = -0x2

.field public static final SERVER_UNREACHABLE:I = -0xc

.field public static final SOCKET_ERROR:I = -0x1

.field public static final TIME_OUT:I = -0x5

.field public static final TRANSACTION_TERMINTED:I = -0x3


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

.method public static toString(I)Ljava/lang/String;
    .locals 2
    .param p0, "errorCode"    # I

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
