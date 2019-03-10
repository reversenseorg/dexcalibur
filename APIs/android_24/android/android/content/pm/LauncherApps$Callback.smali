.class public abstract Landroid/content/pm/LauncherApps$Callback;
.super Ljava/lang/Object;
.source "LauncherApps.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/content/pm/LauncherApps;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x409
    name = "Callback"
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract onPackageAdded(Ljava/lang/String;Landroid/os/UserHandle;)V
.end method

.method public abstract onPackageChanged(Ljava/lang/String;Landroid/os/UserHandle;)V
.end method

.method public abstract onPackageRemoved(Ljava/lang/String;Landroid/os/UserHandle;)V
.end method

.method public abstract onPackagesAvailable([Ljava/lang/String;Landroid/os/UserHandle;Z)V
.end method

.method public abstract onPackagesUnavailable([Ljava/lang/String;Landroid/os/UserHandle;Z)V
.end method
