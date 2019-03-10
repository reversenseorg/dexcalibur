.class public Landroid/graphics/BlurMaskFilter;
.super Landroid/graphics/MaskFilter;
.source "BlurMaskFilter.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/graphics/BlurMaskFilter$Blur;
    }
.end annotation


# direct methods
.method public constructor <init>(FLandroid/graphics/BlurMaskFilter$Blur;)V
    .locals 2
    .param p1, "radius"    # F
    .param p2, "style"    # Landroid/graphics/BlurMaskFilter$Blur;

    .prologue
    .line 12
    invoke-direct {p0}, Landroid/graphics/MaskFilter;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
