.class public interface abstract Lorg/apache/http/HttpConnection;
.super Ljava/lang/Object;
.source "HttpConnection.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract close()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract getMetrics()Lorg/apache/http/HttpConnectionMetrics;
.end method

.method public abstract getSocketTimeout()I
.end method

.method public abstract isOpen()Z
.end method

.method public abstract isStale()Z
.end method

.method public abstract setSocketTimeout(I)V
.end method

.method public abstract shutdown()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
