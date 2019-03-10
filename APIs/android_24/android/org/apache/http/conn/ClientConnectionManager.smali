.class public interface abstract Lorg/apache/http/conn/ClientConnectionManager;
.super Ljava/lang/Object;
.source "ClientConnectionManager.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract closeExpiredConnections()V
.end method

.method public abstract closeIdleConnections(JLjava/util/concurrent/TimeUnit;)V
.end method

.method public abstract getSchemeRegistry()Lorg/apache/http/conn/scheme/SchemeRegistry;
.end method

.method public abstract releaseConnection(Lorg/apache/http/conn/ManagedClientConnection;JLjava/util/concurrent/TimeUnit;)V
.end method

.method public abstract requestConnection(Lorg/apache/http/conn/routing/HttpRoute;Ljava/lang/Object;)Lorg/apache/http/conn/ClientConnectionRequest;
.end method

.method public abstract shutdown()V
.end method
