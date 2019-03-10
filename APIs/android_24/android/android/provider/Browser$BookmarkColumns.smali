.class public Landroid/provider/Browser$BookmarkColumns;
.super Ljava/lang/Object;
.source "Browser.java"

# interfaces
.implements Landroid/provider/BaseColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/Browser;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "BookmarkColumns"
.end annotation


# static fields
.field public static final BOOKMARK:Ljava/lang/String; = "bookmark"

.field public static final CREATED:Ljava/lang/String; = "created"

.field public static final DATE:Ljava/lang/String; = "date"

.field public static final FAVICON:Ljava/lang/String; = "favicon"

.field public static final TITLE:Ljava/lang/String; = "title"

.field public static final URL:Ljava/lang/String; = "url"

.field public static final VISITS:Ljava/lang/String; = "visits"


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 7
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
