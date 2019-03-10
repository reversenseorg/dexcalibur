.class public Landroid/content/Loader;
.super Ljava/lang/Object;
.source "Loader.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/content/Loader$OnLoadCanceledListener;,
        Landroid/content/Loader$OnLoadCompleteListener;,
        Landroid/content/Loader$ForceLoadContentObserver;
    }
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "<D:",
        "Ljava/lang/Object;",
        ">",
        "Ljava/lang/Object;"
    }
.end annotation


# direct methods
.method public constructor <init>(Landroid/content/Context;)V
    .locals 2
    .param p1, "context"    # Landroid/content/Context;

    .prologue
    .line 19
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abandon()V
    .locals 2

    .prologue
    .line 39
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public cancelLoad()Z
    .locals 2

    .prologue
    .line 33
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public commitContentChanged()V
    .locals 2

    .prologue
    .line 44
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public dataToString(Ljava/lang/Object;)Ljava/lang/String;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TD;)",
            "Ljava/lang/String;"
        }
    .end annotation

    .prologue
    .line 47
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    .local p1, "data":Ljava/lang/Object;, "TD;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public deliverCancellation()V
    .locals 2

    .prologue
    .line 21
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public deliverResult(Ljava/lang/Object;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TD;)V"
        }
    .end annotation

    .prologue
    .line 20
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    .local p1, "data":Ljava/lang/Object;, "TD;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public dump(Ljava/lang/String;Ljava/io/FileDescriptor;Ljava/io/PrintWriter;[Ljava/lang/String;)V
    .locals 2
    .param p1, "prefix"    # Ljava/lang/String;
    .param p2, "fd"    # Ljava/io/FileDescriptor;
    .param p3, "writer"    # Ljava/io/PrintWriter;
    .param p4, "args"    # [Ljava/lang/String;

    .prologue
    .line 49
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public forceLoad()V
    .locals 2

    .prologue
    .line 35
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getContext()Landroid/content/Context;
    .locals 2

    .prologue
    .line 22
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getId()I
    .locals 2

    .prologue
    .line 23
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public isAbandoned()Z
    .locals 2

    .prologue
    .line 29
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public isReset()Z
    .locals 2

    .prologue
    .line 30
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public isStarted()Z
    .locals 2

    .prologue
    .line 28
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected onAbandon()V
    .locals 2

    .prologue
    .line 40
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected onCancelLoad()Z
    .locals 2

    .prologue
    .line 34
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public onContentChanged()V
    .locals 2

    .prologue
    .line 46
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected onForceLoad()V
    .locals 2

    .prologue
    .line 36
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected onReset()V
    .locals 2

    .prologue
    .line 42
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected onStartLoading()V
    .locals 2

    .prologue
    .line 32
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected onStopLoading()V
    .locals 2

    .prologue
    .line 38
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public registerListener(ILandroid/content/Loader$OnLoadCompleteListener;)V
    .locals 2
    .param p1, "id"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(I",
            "Landroid/content/Loader$OnLoadCompleteListener",
            "<TD;>;)V"
        }
    .end annotation

    .prologue
    .line 24
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    .local p2, "listener":Landroid/content/Loader$OnLoadCompleteListener;, "Landroid/content/Loader$OnLoadCompleteListener<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public registerOnLoadCanceledListener(Landroid/content/Loader$OnLoadCanceledListener;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Loader$OnLoadCanceledListener",
            "<TD;>;)V"
        }
    .end annotation

    .prologue
    .line 26
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    .local p1, "listener":Landroid/content/Loader$OnLoadCanceledListener;, "Landroid/content/Loader$OnLoadCanceledListener<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public reset()V
    .locals 2

    .prologue
    .line 41
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public rollbackContentChanged()V
    .locals 2

    .prologue
    .line 45
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final startLoading()V
    .locals 2

    .prologue
    .line 31
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public stopLoading()V
    .locals 2

    .prologue
    .line 37
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public takeContentChanged()Z
    .locals 2

    .prologue
    .line 43
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toString()Ljava/lang/String;
    .locals 2

    .prologue
    .line 48
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public unregisterListener(Landroid/content/Loader$OnLoadCompleteListener;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Loader$OnLoadCompleteListener",
            "<TD;>;)V"
        }
    .end annotation

    .prologue
    .line 25
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    .local p1, "listener":Landroid/content/Loader$OnLoadCompleteListener;, "Landroid/content/Loader$OnLoadCompleteListener<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public unregisterOnLoadCanceledListener(Landroid/content/Loader$OnLoadCanceledListener;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Loader$OnLoadCanceledListener",
            "<TD;>;)V"
        }
    .end annotation

    .prologue
    .line 27
    .local p0, "this":Landroid/content/Loader;, "Landroid/content/Loader<TD;>;"
    .local p1, "listener":Landroid/content/Loader$OnLoadCanceledListener;, "Landroid/content/Loader$OnLoadCanceledListener<TD;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
