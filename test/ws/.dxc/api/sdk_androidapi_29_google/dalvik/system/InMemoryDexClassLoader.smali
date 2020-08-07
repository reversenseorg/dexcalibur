.class public final Ldalvik/system/InMemoryDexClassLoader;
.super Ldalvik/system/BaseDexClassLoader;
.source "InMemoryDexClassLoader.java"


# direct methods
.method public constructor <init>(Ljava/nio/ByteBuffer;Ljava/lang/ClassLoader;)V
    .registers 5
    .param p1, "dexBuffer"    # Ljava/nio/ByteBuffer;
        .annotation build Landroidx/annotation/RecentlyNonNull;
        .end annotation
    .end param
    .param p2, "parent"    # Ljava/lang/ClassLoader;
        .annotation build Landroidx/annotation/RecentlyNullable;
        .end annotation
    .end param

    .prologue
    const/4 v0, 0x0

    .line 64
    invoke-direct {p0, v0, v0, v0, v0}, Ldalvik/system/BaseDexClassLoader;-><init>(Ljava/lang/String;Ljava/io/File;Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>([Ljava/nio/ByteBuffer;Ljava/lang/ClassLoader;)V
    .registers 5
    .param p1, "dexBuffers"    # [Ljava/nio/ByteBuffer;
        .annotation build Landroidx/annotation/RecentlyNonNull;
        .end annotation
    .end param
    .param p2, "parent"    # Ljava/lang/ClassLoader;
        .annotation build Landroidx/annotation/RecentlyNullable;
        .end annotation
    .end param

    .prologue
    const/4 v0, 0x0

    .line 53
    invoke-direct {p0, v0, v0, v0, v0}, Ldalvik/system/BaseDexClassLoader;-><init>(Ljava/lang/String;Ljava/io/File;Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>([Ljava/nio/ByteBuffer;Ljava/lang/String;Ljava/lang/ClassLoader;)V
    .registers 6
    .param p1, "dexBuffers"    # [Ljava/nio/ByteBuffer;
        .annotation build Landroid/annotation/NonNull;
        .end annotation
    .end param
    .param p2, "librarySearchPath"    # Ljava/lang/String;
        .annotation build Landroid/annotation/Nullable;
        .end annotation
    .end param
    .param p3, "parent"    # Ljava/lang/ClassLoader;
        .annotation build Landroid/annotation/Nullable;
        .end annotation
    .end param

    .prologue
    const/4 v0, 0x0

    .line 42
    invoke-direct {p0, v0, v0, v0, v0}, Ldalvik/system/BaseDexClassLoader;-><init>(Ljava/lang/String;Ljava/io/File;Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
