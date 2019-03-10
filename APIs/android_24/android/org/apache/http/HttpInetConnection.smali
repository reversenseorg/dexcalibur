.class public interface abstract Lorg/apache/http/HttpInetConnection;
.super Ljava/lang/Object;
.source "HttpInetConnection.java"

# interfaces
.implements Lorg/apache/http/HttpConnection;


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getLocalAddress()Ljava/net/InetAddress;
.end method

.method public abstract getLocalPort()I
.end method

.method public abstract getRemoteAddress()Ljava/net/InetAddress;
.end method

.method public abstract getRemotePort()I
.end method
