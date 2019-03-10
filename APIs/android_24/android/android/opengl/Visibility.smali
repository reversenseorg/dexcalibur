.class public Landroid/opengl/Visibility;
.super Ljava/lang/Object;
.source "Visibility.java"


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static native computeBoundingSphere([FII[FI)V
.end method

.method public static native frustumCullSpheres([FI[FII[III)I
.end method

.method public static native visibilityTest([FI[FI[CII)I
.end method
