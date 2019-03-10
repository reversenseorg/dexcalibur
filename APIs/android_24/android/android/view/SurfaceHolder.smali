.class public interface abstract Landroid/view/SurfaceHolder;
.super Ljava/lang/Object;
.source "SurfaceHolder.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/view/SurfaceHolder$Callback2;,
        Landroid/view/SurfaceHolder$Callback;,
        Landroid/view/SurfaceHolder$BadSurfaceTypeException;
    }
.end annotation


# static fields
.field public static final SURFACE_TYPE_GPU:I = 0x2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SURFACE_TYPE_HARDWARE:I = 0x1
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SURFACE_TYPE_NORMAL:I = 0x0
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SURFACE_TYPE_PUSH_BUFFERS:I = 0x3
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field


# virtual methods
.method public abstract addCallback(Landroid/view/SurfaceHolder$Callback;)V
.end method

.method public abstract getSurface()Landroid/view/Surface;
.end method

.method public abstract getSurfaceFrame()Landroid/graphics/Rect;
.end method

.method public abstract isCreating()Z
.end method

.method public abstract lockCanvas()Landroid/graphics/Canvas;
.end method

.method public abstract lockCanvas(Landroid/graphics/Rect;)Landroid/graphics/Canvas;
.end method

.method public abstract removeCallback(Landroid/view/SurfaceHolder$Callback;)V
.end method

.method public abstract setFixedSize(II)V
.end method

.method public abstract setFormat(I)V
.end method

.method public abstract setKeepScreenOn(Z)V
.end method

.method public abstract setSizeFromLayout()V
.end method

.method public abstract setType(I)V
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end method

.method public abstract unlockCanvasAndPost(Landroid/graphics/Canvas;)V
.end method
