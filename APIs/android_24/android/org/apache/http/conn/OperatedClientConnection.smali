.class public interface abstract Lorg/apache/http/conn/OperatedClientConnection;
.super Ljava/lang/Object;
.source "OperatedClientConnection.java"

# interfaces
.implements Lorg/apache/http/HttpClientConnection;
.implements Lorg/apache/http/HttpInetConnection;


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getSocket()Ljava/net/Socket;
.end method

.method public abstract getTargetHost()Lorg/apache/http/HttpHost;
.end method

.method public abstract isSecure()Z
.end method

.method public abstract openCompleted(ZLorg/apache/http/params/HttpParams;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract opening(Ljava/net/Socket;Lorg/apache/http/HttpHost;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract update(Ljava/net/Socket;Lorg/apache/http/HttpHost;ZLorg/apache/http/params/HttpParams;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
