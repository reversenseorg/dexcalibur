.class public Ljava/util/concurrent/atomic/AtomicMarkableReference;
.super Ljava/lang/Object;
.source "AtomicMarkableReference.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<V:",
        "Ljava/lang/Object;",
        ">",
        "Ljava/lang/Object;"
    }
.end annotation


# direct methods
.method public constructor <init>(Ljava/lang/Object;Z)V
    .locals 2
    .param p2, "initialMark"    # Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;Z)V"
        }
    .end annotation

    .prologue
    .line 4
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    .local p1, "initialRef":Ljava/lang/Object;, "TV;"
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public attemptMark(Ljava/lang/Object;Z)Z
    .locals 2
    .param p2, "newMark"    # Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;Z)Z"
        }
    .end annotation

    .prologue
    .line 11
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    .local p1, "expectedReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public compareAndSet(Ljava/lang/Object;Ljava/lang/Object;ZZ)Z
    .locals 2
    .param p3, "expectedMark"    # Z
    .param p4, "newMark"    # Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;TV;ZZ)Z"
        }
    .end annotation

    .prologue
    .line 9
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    .local p1, "expectedReference":Ljava/lang/Object;, "TV;"
    .local p2, "newReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public get([Z)Ljava/lang/Object;
    .locals 2
    .param p1, "markHolder"    # [Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "([Z)TV;"
        }
    .end annotation

    .prologue
    .line 7
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getReference()Ljava/lang/Object;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()TV;"
        }
    .end annotation

    .prologue
    .line 5
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public isMarked()Z
    .locals 2

    .prologue
    .line 6
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public set(Ljava/lang/Object;Z)V
    .locals 2
    .param p2, "newMark"    # Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;Z)V"
        }
    .end annotation

    .prologue
    .line 10
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    .local p1, "newReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public weakCompareAndSet(Ljava/lang/Object;Ljava/lang/Object;ZZ)Z
    .locals 2
    .param p3, "expectedMark"    # Z
    .param p4, "newMark"    # Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;TV;ZZ)Z"
        }
    .end annotation

    .prologue
    .line 8
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicMarkableReference;, "Ljava/util/concurrent/atomic/AtomicMarkableReference<TV;>;"
    .local p1, "expectedReference":Ljava/lang/Object;, "TV;"
    .local p2, "newReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
