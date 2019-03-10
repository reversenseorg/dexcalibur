.class public interface abstract Ljavax/microedition/khronos/egl/EGL10;
.super Ljava/lang/Object;
.source "EGL10.java"

# interfaces
.implements Ljavax/microedition/khronos/egl/EGL;


# static fields
.field public static final EGL_ALPHA_FORMAT:I = 0x3088

.field public static final EGL_ALPHA_MASK_SIZE:I = 0x303e

.field public static final EGL_ALPHA_SIZE:I = 0x3021

.field public static final EGL_BAD_ACCESS:I = 0x3002

.field public static final EGL_BAD_ALLOC:I = 0x3003

.field public static final EGL_BAD_ATTRIBUTE:I = 0x3004

.field public static final EGL_BAD_CONFIG:I = 0x3005

.field public static final EGL_BAD_CONTEXT:I = 0x3006

.field public static final EGL_BAD_CURRENT_SURFACE:I = 0x3007

.field public static final EGL_BAD_DISPLAY:I = 0x3008

.field public static final EGL_BAD_MATCH:I = 0x3009

.field public static final EGL_BAD_NATIVE_PIXMAP:I = 0x300a

.field public static final EGL_BAD_NATIVE_WINDOW:I = 0x300b

.field public static final EGL_BAD_PARAMETER:I = 0x300c

.field public static final EGL_BAD_SURFACE:I = 0x300d

.field public static final EGL_BLUE_SIZE:I = 0x3022

.field public static final EGL_BUFFER_SIZE:I = 0x3020

.field public static final EGL_COLORSPACE:I = 0x3087

.field public static final EGL_COLOR_BUFFER_TYPE:I = 0x303f

.field public static final EGL_CONFIG_CAVEAT:I = 0x3027

.field public static final EGL_CONFIG_ID:I = 0x3028

.field public static final EGL_CORE_NATIVE_ENGINE:I = 0x305b

.field public static final EGL_DEFAULT_DISPLAY:Ljava/lang/Object;

.field public static final EGL_DEPTH_SIZE:I = 0x3025

.field public static final EGL_DONT_CARE:I = -0x1

.field public static final EGL_DRAW:I = 0x3059

.field public static final EGL_EXTENSIONS:I = 0x3055

.field public static final EGL_GREEN_SIZE:I = 0x3023

.field public static final EGL_HEIGHT:I = 0x3056

.field public static final EGL_HORIZONTAL_RESOLUTION:I = 0x3090

.field public static final EGL_LARGEST_PBUFFER:I = 0x3058

.field public static final EGL_LEVEL:I = 0x3029

.field public static final EGL_LUMINANCE_BUFFER:I = 0x308f

.field public static final EGL_LUMINANCE_SIZE:I = 0x303d

.field public static final EGL_MAX_PBUFFER_HEIGHT:I = 0x302a

.field public static final EGL_MAX_PBUFFER_PIXELS:I = 0x302b

.field public static final EGL_MAX_PBUFFER_WIDTH:I = 0x302c

.field public static final EGL_NATIVE_RENDERABLE:I = 0x302d

.field public static final EGL_NATIVE_VISUAL_ID:I = 0x302e

.field public static final EGL_NATIVE_VISUAL_TYPE:I = 0x302f

.field public static final EGL_NONE:I = 0x3038

.field public static final EGL_NON_CONFORMANT_CONFIG:I = 0x3051

.field public static final EGL_NOT_INITIALIZED:I = 0x3001

.field public static final EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

.field public static final EGL_NO_DISPLAY:Ljavax/microedition/khronos/egl/EGLDisplay;

.field public static final EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

.field public static final EGL_PBUFFER_BIT:I = 0x1

.field public static final EGL_PIXEL_ASPECT_RATIO:I = 0x3092

.field public static final EGL_PIXMAP_BIT:I = 0x2

.field public static final EGL_READ:I = 0x305a

.field public static final EGL_RED_SIZE:I = 0x3024

.field public static final EGL_RENDERABLE_TYPE:I = 0x3040

.field public static final EGL_RENDER_BUFFER:I = 0x3086

.field public static final EGL_RGB_BUFFER:I = 0x308e

.field public static final EGL_SAMPLES:I = 0x3031

.field public static final EGL_SAMPLE_BUFFERS:I = 0x3032

.field public static final EGL_SINGLE_BUFFER:I = 0x3085

.field public static final EGL_SLOW_CONFIG:I = 0x3050

.field public static final EGL_STENCIL_SIZE:I = 0x3026

.field public static final EGL_SUCCESS:I = 0x3000

.field public static final EGL_SURFACE_TYPE:I = 0x3033

.field public static final EGL_TRANSPARENT_BLUE_VALUE:I = 0x3035

.field public static final EGL_TRANSPARENT_GREEN_VALUE:I = 0x3036

.field public static final EGL_TRANSPARENT_RED_VALUE:I = 0x3037

.field public static final EGL_TRANSPARENT_RGB:I = 0x3052

.field public static final EGL_TRANSPARENT_TYPE:I = 0x3034

.field public static final EGL_VENDOR:I = 0x3053

.field public static final EGL_VERSION:I = 0x3054

.field public static final EGL_VERTICAL_RESOLUTION:I = 0x3091

.field public static final EGL_WIDTH:I = 0x3057

.field public static final EGL_WINDOW_BIT:I = 0x4


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 51
    sput-object v0, Ljavax/microedition/khronos/egl/EGL10;->EGL_DEFAULT_DISPLAY:Ljava/lang/Object;

    .line 72
    sput-object v0, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_CONTEXT:Ljavax/microedition/khronos/egl/EGLContext;

    .line 73
    sput-object v0, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_DISPLAY:Ljavax/microedition/khronos/egl/EGLDisplay;

    .line 74
    sput-object v0, Ljavax/microedition/khronos/egl/EGL10;->EGL_NO_SURFACE:Ljavax/microedition/khronos/egl/EGLSurface;

    return-void
.end method


# virtual methods
.method public abstract eglChooseConfig(Ljavax/microedition/khronos/egl/EGLDisplay;[I[Ljavax/microedition/khronos/egl/EGLConfig;I[I)Z
.end method

.method public abstract eglCopyBuffers(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljava/lang/Object;)Z
.end method

.method public abstract eglCreateContext(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljavax/microedition/khronos/egl/EGLContext;[I)Ljavax/microedition/khronos/egl/EGLContext;
.end method

.method public abstract eglCreatePbufferSurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;[I)Ljavax/microedition/khronos/egl/EGLSurface;
.end method

.method public abstract eglCreatePixmapSurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljava/lang/Object;[I)Ljavax/microedition/khronos/egl/EGLSurface;
.end method

.method public abstract eglCreateWindowSurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;Ljava/lang/Object;[I)Ljavax/microedition/khronos/egl/EGLSurface;
.end method

.method public abstract eglDestroyContext(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLContext;)Z
.end method

.method public abstract eglDestroySurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z
.end method

.method public abstract eglGetConfigAttrib(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLConfig;I[I)Z
.end method

.method public abstract eglGetConfigs(Ljavax/microedition/khronos/egl/EGLDisplay;[Ljavax/microedition/khronos/egl/EGLConfig;I[I)Z
.end method

.method public abstract eglGetCurrentContext()Ljavax/microedition/khronos/egl/EGLContext;
.end method

.method public abstract eglGetCurrentDisplay()Ljavax/microedition/khronos/egl/EGLDisplay;
.end method

.method public abstract eglGetCurrentSurface(I)Ljavax/microedition/khronos/egl/EGLSurface;
.end method

.method public abstract eglGetDisplay(Ljava/lang/Object;)Ljavax/microedition/khronos/egl/EGLDisplay;
.end method

.method public abstract eglGetError()I
.end method

.method public abstract eglInitialize(Ljavax/microedition/khronos/egl/EGLDisplay;[I)Z
.end method

.method public abstract eglMakeCurrent(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLSurface;Ljavax/microedition/khronos/egl/EGLContext;)Z
.end method

.method public abstract eglQueryContext(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLContext;I[I)Z
.end method

.method public abstract eglQueryString(Ljavax/microedition/khronos/egl/EGLDisplay;I)Ljava/lang/String;
.end method

.method public abstract eglQuerySurface(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;I[I)Z
.end method

.method public abstract eglSwapBuffers(Ljavax/microedition/khronos/egl/EGLDisplay;Ljavax/microedition/khronos/egl/EGLSurface;)Z
.end method

.method public abstract eglTerminate(Ljavax/microedition/khronos/egl/EGLDisplay;)Z
.end method

.method public abstract eglWaitGL()Z
.end method

.method public abstract eglWaitNative(ILjava/lang/Object;)Z
.end method
