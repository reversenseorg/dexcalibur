.class public interface abstract Landroid/net/nsd/NsdManager$RegistrationListener;
.super Ljava/lang/Object;
.source "NsdManager.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/net/nsd/NsdManager;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "RegistrationListener"
.end annotation


# virtual methods
.method public abstract onRegistrationFailed(Landroid/net/nsd/NsdServiceInfo;I)V
.end method

.method public abstract onServiceRegistered(Landroid/net/nsd/NsdServiceInfo;)V
.end method

.method public abstract onServiceUnregistered(Landroid/net/nsd/NsdServiceInfo;)V
.end method

.method public abstract onUnregistrationFailed(Landroid/net/nsd/NsdServiceInfo;I)V
.end method
