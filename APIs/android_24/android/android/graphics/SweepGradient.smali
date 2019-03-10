.class public Landroid/graphics/SweepGradient;
.super Landroid/graphics/Shader;
.source "SweepGradient.java"


# direct methods
.method public constructor <init>(FFII)V
    .locals 2
    .param p1, "cx"    # F
    .param p2, "cy"    # F
    .param p3, "color0"    # I
    .param p4, "color1"    # I

    .prologue
    .line 6
    invoke-direct {p0}, Landroid/graphics/Shader;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(FF[I[F)V
    .locals 2
    .param p1, "cx"    # F
    .param p2, "cy"    # F
    .param p3, "colors"    # [I
    .param p4, "positions"    # [F

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/graphics/Shader;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
