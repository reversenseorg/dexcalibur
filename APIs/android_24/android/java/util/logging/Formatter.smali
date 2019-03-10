.class public abstract Ljava/util/logging/Formatter;
.super Ljava/lang/Object;
.source "Formatter.java"


# direct methods
.method protected constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract format(Ljava/util/logging/LogRecord;)Ljava/lang/String;
.end method

.method public formatMessage(Ljava/util/logging/LogRecord;)Ljava/lang/String;
    .locals 2
    .param p1, "r"    # Ljava/util/logging/LogRecord;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getHead(Ljava/util/logging/Handler;)Ljava/lang/String;
    .locals 2
    .param p1, "h"    # Ljava/util/logging/Handler;

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getTail(Ljava/util/logging/Handler;)Ljava/lang/String;
    .locals 2
    .param p1, "h"    # Ljava/util/logging/Handler;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
