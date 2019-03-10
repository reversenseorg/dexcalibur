.class public interface abstract Lorg/apache/http/conn/routing/HttpRouteDirector;
.super Ljava/lang/Object;
.source "HttpRouteDirector.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final COMPLETE:I = 0x0

.field public static final CONNECT_PROXY:I = 0x2

.field public static final CONNECT_TARGET:I = 0x1

.field public static final LAYER_PROTOCOL:I = 0x5

.field public static final TUNNEL_PROXY:I = 0x4

.field public static final TUNNEL_TARGET:I = 0x3

.field public static final UNREACHABLE:I = -0x1


# virtual methods
.method public abstract nextStep(Lorg/apache/http/conn/routing/RouteInfo;Lorg/apache/http/conn/routing/RouteInfo;)I
.end method
