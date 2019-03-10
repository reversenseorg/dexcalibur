.class public abstract Landroid/media/effect/Effect;
.super Ljava/lang/Object;
.source "Effect.java"


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


# virtual methods
.method public abstract apply(IIII)V
.end method

.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract release()V
.end method

.method public abstract setParameter(Ljava/lang/String;Ljava/lang/Object;)V
.end method

.method public setUpdateListener(Landroid/media/effect/EffectUpdateListener;)V
    .locals 2
    .param p1, "listener"    # Landroid/media/effect/EffectUpdateListener;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
