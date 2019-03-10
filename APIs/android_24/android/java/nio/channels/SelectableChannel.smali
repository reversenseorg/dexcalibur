.class public abstract Ljava/nio/channels/SelectableChannel;
.super Ljava/nio/channels/spi/AbstractInterruptibleChannel;
.source "SelectableChannel.java"

# interfaces
.implements Ljava/nio/channels/Channel;


# direct methods
.method protected constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/nio/channels/spi/AbstractInterruptibleChannel;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract blockingLock()Ljava/lang/Object;
.end method

.method public abstract configureBlocking(Z)Ljava/nio/channels/SelectableChannel;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract isBlocking()Z
.end method

.method public abstract isRegistered()Z
.end method

.method public abstract keyFor(Ljava/nio/channels/Selector;)Ljava/nio/channels/SelectionKey;
.end method

.method public abstract provider()Ljava/nio/channels/spi/SelectorProvider;
.end method

.method public final register(Ljava/nio/channels/Selector;I)Ljava/nio/channels/SelectionKey;
    .locals 2
    .param p1, "selector"    # Ljava/nio/channels/Selector;
    .param p2, "operations"    # I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/nio/channels/ClosedChannelException;
        }
    .end annotation

    .prologue
    .line 13
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract register(Ljava/nio/channels/Selector;ILjava/lang/Object;)Ljava/nio/channels/SelectionKey;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/nio/channels/ClosedChannelException;
        }
    .end annotation
.end method

.method public abstract validOps()I
.end method
