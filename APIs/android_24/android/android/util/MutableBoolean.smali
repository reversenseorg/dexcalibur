.class public final Landroid/util/MutableBoolean;
.super Ljava/lang/Object;
.source "MutableBoolean.java"


# instance fields
.field public value:Z


# direct methods
.method public constructor <init>(Z)V
    .locals 2
    .param p1, "value"    # Z

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
