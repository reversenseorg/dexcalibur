.class public abstract Ljava/nio/channels/Pipe$SinkChannel;
.super Ljava/nio/channels/spi/AbstractSelectableChannel;
.source "Pipe.java"

# interfaces
.implements Ljava/nio/channels/WritableByteChannel;
.implements Ljava/nio/channels/GatheringByteChannel;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/nio/channels/Pipe;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x409
    name = "SinkChannel"
.end annotation


# direct methods
.method protected constructor <init>(Ljava/nio/channels/spi/SelectorProvider;)V
    .locals 2
    .param p1, "provider"    # Ljava/nio/channels/spi/SelectorProvider;

    .prologue
    .line 8
    const/4 v0, 0x0

    check-cast v0, Ljava/nio/channels/spi/SelectorProvider;

    invoke-direct {p0, v0}, Ljava/nio/channels/spi/AbstractSelectableChannel;-><init>(Ljava/nio/channels/spi/SelectorProvider;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public final validOps()I
    .locals 2

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
