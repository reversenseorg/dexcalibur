.class public abstract Ljava/io/ObjectOutputStream$PutField;
.super Ljava/lang/Object;
.source "ObjectOutputStream.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/io/ObjectOutputStream;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x409
    name = "PutField"
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 8
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract put(Ljava/lang/String;B)V
.end method

.method public abstract put(Ljava/lang/String;C)V
.end method

.method public abstract put(Ljava/lang/String;D)V
.end method

.method public abstract put(Ljava/lang/String;F)V
.end method

.method public abstract put(Ljava/lang/String;I)V
.end method

.method public abstract put(Ljava/lang/String;J)V
.end method

.method public abstract put(Ljava/lang/String;Ljava/lang/Object;)V
.end method

.method public abstract put(Ljava/lang/String;S)V
.end method

.method public abstract put(Ljava/lang/String;Z)V
.end method

.method public abstract write(Ljava/io/ObjectOutput;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end method
