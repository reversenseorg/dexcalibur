.class public interface abstract Lorg/apache/http/conn/ConnectionReleaseTrigger;
.super Ljava/lang/Object;
.source "ConnectionReleaseTrigger.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract abortConnection()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract releaseConnection()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
