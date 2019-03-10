.class public Landroid/graphics/ColorMatrixColorFilter;
.super Landroid/graphics/ColorFilter;
.source "ColorMatrixColorFilter.java"


# direct methods
.method public constructor <init>(Landroid/graphics/ColorMatrix;)V
    .locals 2
    .param p1, "matrix"    # Landroid/graphics/ColorMatrix;

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/graphics/ColorFilter;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>([F)V
    .locals 2
    .param p1, "array"    # [F

    .prologue
    .line 6
    invoke-direct {p0}, Landroid/graphics/ColorFilter;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
