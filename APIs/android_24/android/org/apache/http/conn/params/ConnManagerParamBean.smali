.class public Lorg/apache/http/conn/params/ConnManagerParamBean;
.super Lorg/apache/http/params/HttpAbstractParamBean;
.source "ConnManagerParamBean.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# direct methods
.method public constructor <init>(Lorg/apache/http/params/HttpParams;)V
    .locals 2
    .param p1, "params"    # Lorg/apache/http/params/HttpParams;

    .prologue
    .line 6
    const/4 v0, 0x0

    check-cast v0, Lorg/apache/http/params/HttpParams;

    invoke-direct {p0, v0}, Lorg/apache/http/params/HttpAbstractParamBean;-><init>(Lorg/apache/http/params/HttpParams;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public setConnectionsPerRoute(Lorg/apache/http/conn/params/ConnPerRouteBean;)V
    .locals 2
    .param p1, "connPerRoute"    # Lorg/apache/http/conn/params/ConnPerRouteBean;

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setMaxTotalConnections(I)V
    .locals 2
    .param p1, "maxConnections"    # I

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setTimeout(J)V
    .locals 2
    .param p1, "timeout"    # J

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
