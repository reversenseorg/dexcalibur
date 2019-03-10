.class public Ljava/lang/InheritableThreadLocal;
.super Ljava/lang/ThreadLocal;
.source "InheritableThreadLocal.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<T:",
        "Ljava/lang/Object;",
        ">",
        "Ljava/lang/ThreadLocal",
        "<TT;>;"
    }
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    .local p0, "this":Ljava/lang/InheritableThreadLocal;, "Ljava/lang/InheritableThreadLocal<TT;>;"
    invoke-direct {p0}, Ljava/lang/ThreadLocal;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method protected childValue(Ljava/lang/Object;)Ljava/lang/Object;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TT;)TT;"
        }
    .end annotation

    .prologue
    .line 6
    .local p0, "this":Ljava/lang/InheritableThreadLocal;, "Ljava/lang/InheritableThreadLocal<TT;>;"
    .local p1, "parentValue":Ljava/lang/Object;, "TT;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
