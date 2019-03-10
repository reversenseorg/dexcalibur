.class public interface abstract Lorg/apache/http/conn/ClientConnectionRequest;
.super Ljava/lang/Object;
.source "ClientConnectionRequest.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract abortRequest()V
.end method

.method public abstract getConnection(JLjava/util/concurrent/TimeUnit;)Lorg/apache/http/conn/ManagedClientConnection;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/InterruptedException;,
            Lorg/apache/http/conn/ConnectionPoolTimeoutException;
        }
    .end annotation
.end method
