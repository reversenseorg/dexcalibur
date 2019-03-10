.class public final Landroid/util/MutableFloat;
.super Ljava/lang/Object;
.source "MutableFloat.java"


# instance fields
.field public value:F


# direct methods
.method public constructor <init>(F)V
    .locals 2
    .param p1, "value"    # F

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
