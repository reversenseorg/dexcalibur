.class public abstract Landroid/hardware/TriggerEventListener;
.super Ljava/lang/Object;
.source "TriggerEventListener.java"


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
.method public abstract onTrigger(Landroid/hardware/TriggerEvent;)V
.end method
