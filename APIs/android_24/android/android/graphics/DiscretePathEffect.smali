.class public Landroid/graphics/DiscretePathEffect;
.super Landroid/graphics/PathEffect;
.source "DiscretePathEffect.java"


# direct methods
.method public constructor <init>(FF)V
    .locals 2
    .param p1, "segmentLength"    # F
    .param p2, "deviation"    # F

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/graphics/PathEffect;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
