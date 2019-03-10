.class public interface abstract Ljava/nio/channels/GatheringByteChannel;
.super Ljava/lang/Object;
.source "GatheringByteChannel.java"

# interfaces
.implements Ljava/nio/channels/WritableByteChannel;


# virtual methods
.method public abstract write([Ljava/nio/ByteBuffer;)J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract write([Ljava/nio/ByteBuffer;II)J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
