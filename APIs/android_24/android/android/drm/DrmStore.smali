.class public Landroid/drm/DrmStore;
.super Ljava/lang/Object;
.source "DrmStore.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/drm/DrmStore$RightsStatus;,
        Landroid/drm/DrmStore$Action;,
        Landroid/drm/DrmStore$Playback;,
        Landroid/drm/DrmStore$DrmObjectType;,
        Landroid/drm/DrmStore$ConstraintsColumns;
    }
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation

    .prologue
    .line 54
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
