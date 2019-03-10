.class public Ljava/util/concurrent/atomic/AtomicStampedReference;
.super Ljava/lang/Object;
.source "AtomicStampedReference.java"


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
.method public constructor <init>(Ljava/lang/Object;I)V
    .locals 2
    .param p2, "initialStamp"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;I)V"
        }
    .end annotation

    .prologue
    .line 4
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    .local p1, "initialRef":Ljava/lang/Object;, "TV;"
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public attemptStamp(Ljava/lang/Object;I)Z
    .locals 2
    .param p2, "newStamp"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;I)Z"
        }
    .end annotation

    .prologue
    .line 11
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    .local p1, "expectedReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public compareAndSet(Ljava/lang/Object;Ljava/lang/Object;II)Z
    .locals 2
    .param p3, "expectedStamp"    # I
    .param p4, "newStamp"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;TV;II)Z"
        }
    .end annotation

    .prologue
    .line 9
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    .local p1, "expectedReference":Ljava/lang/Object;, "TV;"
    .local p2, "newReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public get([I)Ljava/lang/Object;
    .locals 2
    .param p1, "stampHolder"    # [I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "([I)TV;"
        }
    .end annotation

    .prologue
    .line 7
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
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
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getStamp()I
    .locals 2

    .prologue
    .line 6
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public set(Ljava/lang/Object;I)V
    .locals 2
    .param p2, "newStamp"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;I)V"
        }
    .end annotation

    .prologue
    .line 10
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    .local p1, "newReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public weakCompareAndSet(Ljava/lang/Object;Ljava/lang/Object;II)Z
    .locals 2
    .param p3, "expectedStamp"    # I
    .param p4, "newStamp"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;TV;II)Z"
        }
    .end annotation

    .prologue
    .line 8
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicStampedReference;, "Ljava/util/concurrent/atomic/AtomicStampedReference<TV;>;"
    .local p1, "expectedReference":Ljava/lang/Object;, "TV;"
    .local p2, "newReference":Ljava/lang/Object;, "TV;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
