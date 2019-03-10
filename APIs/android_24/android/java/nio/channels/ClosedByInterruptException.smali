.class public Ljava/nio/channels/ClosedByInterruptException;
.super Ljava/nio/channels/AsynchronousCloseException;
.source "ClosedByInterruptException.java"


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/nio/channels/AsynchronousCloseException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
