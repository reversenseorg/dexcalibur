.class public interface abstract Landroid/net/nsd/NsdManager$DiscoveryListener;
.super Ljava/lang/Object;
.source "NsdManager.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/net/nsd/NsdManager;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "DiscoveryListener"
.end annotation


# virtual methods
.method public abstract onDiscoveryStarted(Ljava/lang/String;)V
.end method

.method public abstract onDiscoveryStopped(Ljava/lang/String;)V
.end method

.method public abstract onServiceFound(Landroid/net/nsd/NsdServiceInfo;)V
.end method

.method public abstract onServiceLost(Landroid/net/nsd/NsdServiceInfo;)V
.end method

.method public abstract onStartDiscoveryFailed(Ljava/lang/String;I)V
.end method

.method public abstract onStopDiscoveryFailed(Ljava/lang/String;I)V
.end method
