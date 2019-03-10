.class public interface abstract Landroid/widget/RemoteViewsService$RemoteViewsFactory;
.super Ljava/lang/Object;
.source "RemoteViewsService.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/widget/RemoteViewsService;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "RemoteViewsFactory"
.end annotation


# virtual methods
.method public abstract getCount()I
.end method

.method public abstract getItemId(I)J
.end method

.method public abstract getLoadingView()Landroid/widget/RemoteViews;
.end method

.method public abstract getViewAt(I)Landroid/widget/RemoteViews;
.end method

.method public abstract getViewTypeCount()I
.end method

.method public abstract hasStableIds()Z
.end method

.method public abstract onCreate()V
.end method

.method public abstract onDataSetChanged()V
.end method

.method public abstract onDestroy()V
.end method
