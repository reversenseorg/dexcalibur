.class public interface abstract Lorg/apache/http/conn/routing/RouteInfo;
.super Ljava/lang/Object;
.source "RouteInfo.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lorg/apache/http/conn/routing/RouteInfo$LayerType;,
        Lorg/apache/http/conn/routing/RouteInfo$TunnelType;
    }
.end annotation

.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getHopCount()I
.end method

.method public abstract getHopTarget(I)Lorg/apache/http/HttpHost;
.end method

.method public abstract getLayerType()Lorg/apache/http/conn/routing/RouteInfo$LayerType;
.end method

.method public abstract getLocalAddress()Ljava/net/InetAddress;
.end method

.method public abstract getProxyHost()Lorg/apache/http/HttpHost;
.end method

.method public abstract getTargetHost()Lorg/apache/http/HttpHost;
.end method

.method public abstract getTunnelType()Lorg/apache/http/conn/routing/RouteInfo$TunnelType;
.end method

.method public abstract isLayered()Z
.end method

.method public abstract isSecure()Z
.end method

.method public abstract isTunnelled()Z
.end method
