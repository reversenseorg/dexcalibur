.class public Landroid/util/FloatMath;
.super Ljava/lang/Object;
.source "FloatMath.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static native ceil(F)F
.end method

.method public static native cos(F)F
.end method

.method public static native exp(F)F
.end method

.method public static native floor(F)F
.end method

.method public static native hypot(FF)F
.end method

.method public static native pow(FF)F
.end method

.method public static native sin(F)F
.end method

.method public static native sqrt(F)F
.end method
