.class public Landroid/drm/DrmInfoStatus;
.super Ljava/lang/Object;
.source "DrmInfoStatus.java"


# static fields
.field public static final STATUS_ERROR:I = 0x2

.field public static final STATUS_OK:I = 0x1


# instance fields
.field public final data:Landroid/drm/ProcessedData;

.field public final infoType:I

.field public final mimeType:Ljava/lang/String;

.field public final statusCode:I


# direct methods
.method public constructor <init>(IILandroid/drm/ProcessedData;Ljava/lang/String;)V
    .locals 2
    .param p1, "statusCode"    # I
    .param p2, "infoType"    # I
    .param p3, "data"    # Landroid/drm/ProcessedData;
    .param p4, "mimeType"    # Ljava/lang/String;

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
