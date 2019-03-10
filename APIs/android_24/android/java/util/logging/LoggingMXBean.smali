.class public interface abstract Ljava/util/logging/LoggingMXBean;
.super Ljava/lang/Object;
.source "LoggingMXBean.java"


# virtual methods
.method public abstract getLoggerLevel(Ljava/lang/String;)Ljava/lang/String;
.end method

.method public abstract getLoggerNames()Ljava/util/List;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List",
            "<",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getParentLoggerName(Ljava/lang/String;)Ljava/lang/String;
.end method

.method public abstract setLoggerLevel(Ljava/lang/String;Ljava/lang/String;)V
.end method
