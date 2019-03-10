.class public abstract Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;
.super Ljava/lang/Object;
.source "AtomicIntegerFieldUpdater.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<T:",
        "Ljava/lang/Object;",
        ">",
        "Ljava/lang/Object;"
    }
.end annotation


# direct methods
.method protected constructor <init>()V
    .locals 2

    .prologue
    .line 4
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newUpdater(Ljava/lang/Class;Ljava/lang/String;)Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;
    .locals 2
    .param p1, "fieldName"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "<U:",
            "Ljava/lang/Object;",
            ">(",
            "Ljava/lang/Class",
            "<TU;>;",
            "Ljava/lang/String;",
            ")",
            "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater",
            "<TU;>;"
        }
    .end annotation

    .prologue
    .line 5
    .local p0, "tclass":Ljava/lang/Class;, "Ljava/lang/Class<TU;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public addAndGet(Ljava/lang/Object;I)I
    .locals 2
    .param p2, "delta"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;I)I"
        }
    .end annotation

    .prologue
    .line 17
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract compareAndSet(Ljava/lang/Object;II)Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;II)Z"
        }
    .end annotation
.end method

.method public decrementAndGet(Ljava/lang/Object;)I
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;)I"
        }
    .end annotation

    .prologue
    .line 16
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract get(Ljava/lang/Object;)I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;)I"
        }
    .end annotation
.end method

.method public getAndAdd(Ljava/lang/Object;I)I
    .locals 2
    .param p2, "delta"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;I)I"
        }
    .end annotation

    .prologue
    .line 14
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getAndDecrement(Ljava/lang/Object;)I
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;)I"
        }
    .end annotation

    .prologue
    .line 13
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getAndIncrement(Ljava/lang/Object;)I
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;)I"
        }
    .end annotation

    .prologue
    .line 12
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getAndSet(Ljava/lang/Object;I)I
    .locals 2
    .param p2, "newValue"    # I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;I)I"
        }
    .end annotation

    .prologue
    .line 11
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public incrementAndGet(Ljava/lang/Object;)I
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;)I"
        }
    .end annotation

    .prologue
    .line 15
    .local p0, "this":Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater;, "Ljava/util/concurrent/atomic/AtomicIntegerFieldUpdater<TT;>;"
    .local p1, "obj":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract lazySet(Ljava/lang/Object;I)V
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;I)V"
        }
    .end annotation
.end method

.method public abstract set(Ljava/lang/Object;I)V
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;I)V"
        }
    .end annotation
.end method

.method public abstract weakCompareAndSet(Ljava/lang/Object;II)Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;II)Z"
        }
    .end annotation
.end method
