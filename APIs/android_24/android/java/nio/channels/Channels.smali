.class public final Ljava/nio/channels/Channels;
.super Ljava/lang/Object;
.source "Channels.java"


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

.method public static newChannel(Ljava/io/InputStream;)Ljava/nio/channels/ReadableByteChannel;
    .locals 2
    .param p0, "inputStream"    # Ljava/io/InputStream;

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newChannel(Ljava/io/OutputStream;)Ljava/nio/channels/WritableByteChannel;
    .locals 2
    .param p0, "outputStream"    # Ljava/io/OutputStream;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newInputStream(Ljava/nio/channels/ReadableByteChannel;)Ljava/io/InputStream;
    .locals 2
    .param p0, "channel"    # Ljava/nio/channels/ReadableByteChannel;

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newOutputStream(Ljava/nio/channels/WritableByteChannel;)Ljava/io/OutputStream;
    .locals 2
    .param p0, "channel"    # Ljava/nio/channels/WritableByteChannel;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newReader(Ljava/nio/channels/ReadableByteChannel;Ljava/lang/String;)Ljava/io/Reader;
    .locals 2
    .param p0, "channel"    # Ljava/nio/channels/ReadableByteChannel;
    .param p1, "charsetName"    # Ljava/lang/String;

    .prologue
    .line 10
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newReader(Ljava/nio/channels/ReadableByteChannel;Ljava/nio/charset/CharsetDecoder;I)Ljava/io/Reader;
    .locals 2
    .param p0, "channel"    # Ljava/nio/channels/ReadableByteChannel;
    .param p1, "decoder"    # Ljava/nio/charset/CharsetDecoder;
    .param p2, "minBufferCapacity"    # I

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newWriter(Ljava/nio/channels/WritableByteChannel;Ljava/lang/String;)Ljava/io/Writer;
    .locals 2
    .param p0, "channel"    # Ljava/nio/channels/WritableByteChannel;
    .param p1, "charsetName"    # Ljava/lang/String;

    .prologue
    .line 12
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newWriter(Ljava/nio/channels/WritableByteChannel;Ljava/nio/charset/CharsetEncoder;I)Ljava/io/Writer;
    .locals 2
    .param p0, "channel"    # Ljava/nio/channels/WritableByteChannel;
    .param p1, "encoder"    # Ljava/nio/charset/CharsetEncoder;
    .param p2, "minBufferCapacity"    # I

    .prologue
    .line 11
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
