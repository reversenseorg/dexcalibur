.class public Landroid/opengl/GLU;
.super Ljava/lang/Object;
.source "GLU.java"


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

.method public static gluErrorString(I)Ljava/lang/String;
    .locals 2
    .param p0, "error"    # I

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static gluLookAt(Ljavax/microedition/khronos/opengles/GL10;FFFFFFFFF)V
    .locals 2
    .param p0, "gl"    # Ljavax/microedition/khronos/opengles/GL10;
    .param p1, "eyeX"    # F
    .param p2, "eyeY"    # F
    .param p3, "eyeZ"    # F
    .param p4, "centerX"    # F
    .param p5, "centerY"    # F
    .param p6, "centerZ"    # F
    .param p7, "upX"    # F
    .param p8, "upY"    # F
    .param p9, "upZ"    # F

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static gluOrtho2D(Ljavax/microedition/khronos/opengles/GL10;FFFF)V
    .locals 2
    .param p0, "gl"    # Ljavax/microedition/khronos/opengles/GL10;
    .param p1, "left"    # F
    .param p2, "right"    # F
    .param p3, "bottom"    # F
    .param p4, "top"    # F

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static gluPerspective(Ljavax/microedition/khronos/opengles/GL10;FFFF)V
    .locals 2
    .param p0, "gl"    # Ljavax/microedition/khronos/opengles/GL10;
    .param p1, "fovy"    # F
    .param p2, "aspect"    # F
    .param p3, "zNear"    # F
    .param p4, "zFar"    # F

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static gluProject(FFF[FI[FI[II[FI)I
    .locals 2
    .param p0, "objX"    # F
    .param p1, "objY"    # F
    .param p2, "objZ"    # F
    .param p3, "model"    # [F
    .param p4, "modelOffset"    # I
    .param p5, "project"    # [F
    .param p6, "projectOffset"    # I
    .param p7, "view"    # [I
    .param p8, "viewOffset"    # I
    .param p9, "win"    # [F
    .param p10, "winOffset"    # I

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static gluUnProject(FFF[FI[FI[II[FI)I
    .locals 2
    .param p0, "winX"    # F
    .param p1, "winY"    # F
    .param p2, "winZ"    # F
    .param p3, "model"    # [F
    .param p4, "modelOffset"    # I
    .param p5, "project"    # [F
    .param p6, "projectOffset"    # I
    .param p7, "view"    # [I
    .param p8, "viewOffset"    # I
    .param p9, "obj"    # [F
    .param p10, "objOffset"    # I

    .prologue
    .line 10
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
