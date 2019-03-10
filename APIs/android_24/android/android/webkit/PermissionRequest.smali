.class public abstract Landroid/webkit/PermissionRequest;
.super Ljava/lang/Object;
.source "PermissionRequest.java"


# static fields
.field public static final RESOURCE_AUDIO_CAPTURE:Ljava/lang/String; = "android.webkit.resource.AUDIO_CAPTURE"

.field public static final RESOURCE_PROTECTED_MEDIA_ID:Ljava/lang/String; = "android.webkit.resource.PROTECTED_MEDIA_ID"

.field public static final RESOURCE_VIDEO_CAPTURE:Ljava/lang/String; = "android.webkit.resource.VIDEO_CAPTURE"


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
.method public abstract deny()V
.end method

.method public abstract getOrigin()Landroid/net/Uri;
.end method

.method public abstract getResources()[Ljava/lang/String;
.end method

.method public abstract grant([Ljava/lang/String;)V
.end method
