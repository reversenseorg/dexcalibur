.class public interface abstract Lorg/apache/http/HttpEntity;
.super Ljava/lang/Object;
.source "HttpEntity.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract consumeContent()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract getContent()Ljava/io/InputStream;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;,
            Ljava/lang/IllegalStateException;
        }
    .end annotation
.end method

.method public abstract getContentEncoding()Lorg/apache/http/Header;
.end method

.method public abstract getContentLength()J
.end method

.method public abstract getContentType()Lorg/apache/http/Header;
.end method

.method public abstract isChunked()Z
.end method

.method public abstract isRepeatable()Z
.end method

.method public abstract isStreaming()Z
.end method

.method public abstract writeTo(Ljava/io/OutputStream;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
