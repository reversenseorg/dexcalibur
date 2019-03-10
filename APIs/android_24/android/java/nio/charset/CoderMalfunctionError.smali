.class public Ljava/nio/charset/CoderMalfunctionError;
.super Ljava/lang/Error;
.source "CoderMalfunctionError.java"


# direct methods
.method public constructor <init>(Ljava/lang/Exception;)V
    .locals 2
    .param p1, "ex"    # Ljava/lang/Exception;

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Error;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
