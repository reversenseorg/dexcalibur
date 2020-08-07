.class public Ldalvik/system/DexClassLoader;
.super Ldalvik/system/BaseDexClassLoader;
.source "DexClassLoader.java"


# direct methods
.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/ClassLoader;)V
    .registers 7
    .param p1, "dexPath"    # Ljava/lang/String;
    .param p2, "optimizedDirectory"    # Ljava/lang/String;
    .param p3, "librarySearchPath"    # Ljava/lang/String;
    .param p4, "parent"    # Ljava/lang/ClassLoader;

    .prologue
    const/4 v0, 0x0

    .line 61
    invoke-direct {p0, v0, v0, v0, v0}, Ldalvik/system/BaseDexClassLoader;-><init>(Ljava/lang/String;Ljava/io/File;Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
