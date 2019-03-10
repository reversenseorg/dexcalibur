.class public Landroid/opengl/EGLExt;
.super Ljava/lang/Object;
.source "EGLExt.java"


# static fields
.field public static final EGL_CONTEXT_FLAGS_KHR:I = 0x30fc

.field public static final EGL_CONTEXT_MAJOR_VERSION_KHR:I = 0x3098

.field public static final EGL_CONTEXT_MINOR_VERSION_KHR:I = 0x30fb

.field public static final EGL_OPENGL_ES3_BIT_KHR:I = 0x40


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

.method public static native eglPresentationTimeANDROID(Landroid/opengl/EGLDisplay;Landroid/opengl/EGLSurface;J)Z
.end method
