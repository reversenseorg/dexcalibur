.class public Landroid/graphics/ComposePathEffect;
.super Landroid/graphics/PathEffect;
.source "ComposePathEffect.java"


# direct methods
.method public constructor <init>(Landroid/graphics/PathEffect;Landroid/graphics/PathEffect;)V
    .locals 2
    .param p1, "outerpe"    # Landroid/graphics/PathEffect;
    .param p2, "innerpe"    # Landroid/graphics/PathEffect;

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/graphics/PathEffect;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
