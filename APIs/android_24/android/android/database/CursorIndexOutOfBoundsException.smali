.class public Landroid/database/CursorIndexOutOfBoundsException;
.super Ljava/lang/IndexOutOfBoundsException;
.source "CursorIndexOutOfBoundsException.java"


# direct methods
.method public constructor <init>(II)V
    .locals 2
    .param p1, "index"    # I
    .param p2, "size"    # I

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/IndexOutOfBoundsException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;)V
    .locals 2
    .param p1, "message"    # Ljava/lang/String;

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/lang/IndexOutOfBoundsException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
