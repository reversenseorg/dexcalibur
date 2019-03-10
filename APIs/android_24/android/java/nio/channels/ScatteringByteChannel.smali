.class public interface abstract Ljava/nio/channels/ScatteringByteChannel;
.super Ljava/lang/Object;
.source "ScatteringByteChannel.java"

# interfaces
.implements Ljava/nio/channels/ReadableByteChannel;


# virtual methods
.method public abstract read([Ljava/nio/ByteBuffer;)J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract read([Ljava/nio/ByteBuffer;II)J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
