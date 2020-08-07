.class public final Ldalvik/system/DelegateLastClassLoader;
.super Ldalvik/system/PathClassLoader;
.source "DelegateLastClassLoader.java"


# direct methods
.method public constructor <init>(Ljava/lang/String;Ljava/lang/ClassLoader;)V
    .registers 5
    .param p1, "dexPath"    # Ljava/lang/String;
    .param p2, "parent"    # Ljava/lang/ClassLoader;

    .prologue
    const/4 v1, 0x0

    .line 44
    move-object v0, v1

    check-cast v0, Ljava/lang/String;

    check-cast v1, Ljava/lang/ClassLoader;

    invoke-direct {p0, v0, v1}, Ldalvik/system/PathClassLoader;-><init>(Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;Ljava/lang/ClassLoader;)V
    .registers 6
    .param p1, "dexPath"    # Ljava/lang/String;
    .param p2, "librarySearchPath"    # Ljava/lang/String;
    .param p3, "parent"    # Ljava/lang/ClassLoader;

    .prologue
    const/4 v1, 0x0

    .line 52
    move-object v0, v1

    check-cast v0, Ljava/lang/String;

    check-cast v1, Ljava/lang/ClassLoader;

    invoke-direct {p0, v0, v1}, Ldalvik/system/PathClassLoader;-><init>(Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;Ljava/lang/ClassLoader;Z)V
    .registers 7
    .param p1, "dexPath"    # Ljava/lang/String;
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
    .param p4, "delegateResourceLoading"    # Z

    .prologue
    const/4 v1, 0x0

    .line 92
    move-object v0, v1

    check-cast v0, Ljava/lang/String;

    check-cast v1, Ljava/lang/ClassLoader;

    invoke-direct {p0, v0, v1}, Ldalvik/system/PathClassLoader;-><init>(Ljava/lang/String;Ljava/lang/ClassLoader;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getResource(Ljava/lang/String;)Ljava/net/URL;
    .registers 4
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 100
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getResources(Ljava/lang/String;)Ljava/util/Enumeration;
    .registers 4
    .param p1, "name"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            ")",
            "Ljava/util/Enumeration",
            "<",
            "Ljava/net/URL;",
            ">;"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .prologue
    .line 104
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected loadClass(Ljava/lang/String;Z)Ljava/lang/Class;
    .registers 5
    .param p1, "name"    # Ljava/lang/String;
    .param p2, "resolve"    # Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            "Z)",
            "Ljava/lang/Class",
            "<*>;"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;
        }
    .end annotation

    .prologue
    .line 96
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
