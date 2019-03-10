.class public Landroid/drm/DrmStore$Action;
.super Ljava/lang/Object;
.source "DrmStore.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/drm/DrmStore;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "Action"
.end annotation


# static fields
.field public static final DEFAULT:I = 0x0

.field public static final DISPLAY:I = 0x7

.field public static final EXECUTE:I = 0x6

.field public static final OUTPUT:I = 0x4

.field public static final PLAY:I = 0x1

.field public static final PREVIEW:I = 0x5

.field public static final RINGTONE:I = 0x2

.field public static final TRANSFER:I = 0x3


# direct methods
.method public constructor <init>()V
    .locals 2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation

    .prologue
    .line 34
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
