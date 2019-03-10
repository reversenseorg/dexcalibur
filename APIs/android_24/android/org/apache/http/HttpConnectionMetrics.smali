.class public interface abstract Lorg/apache/http/HttpConnectionMetrics;
.super Ljava/lang/Object;
.source "HttpConnectionMetrics.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getMetric(Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract getReceivedBytesCount()J
.end method

.method public abstract getRequestCount()J
.end method

.method public abstract getResponseCount()J
.end method

.method public abstract getSentBytesCount()J
.end method

.method public abstract reset()V
.end method
