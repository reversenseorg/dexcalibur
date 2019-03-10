.class public interface abstract Landroid/media/MediaScannerConnection$MediaScannerConnectionClient;
.super Ljava/lang/Object;
.source "MediaScannerConnection.java"

# interfaces
.implements Landroid/media/MediaScannerConnection$OnScanCompletedListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/media/MediaScannerConnection;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "MediaScannerConnectionClient"
.end annotation


# virtual methods
.method public abstract onMediaScannerConnected()V
.end method

.method public abstract onScanCompleted(Ljava/lang/String;Landroid/net/Uri;)V
.end method
