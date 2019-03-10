.class public final Landroid/provider/LiveFolders;
.super Ljava/lang/Object;
.source "LiveFolders.java"

# interfaces
.implements Landroid/provider/BaseColumns;


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final ACTION_CREATE_LIVE_FOLDER:Ljava/lang/String; = "android.intent.action.CREATE_LIVE_FOLDER"

.field public static final DESCRIPTION:Ljava/lang/String; = "description"

.field public static final DISPLAY_MODE_GRID:I = 0x1

.field public static final DISPLAY_MODE_LIST:I = 0x2

.field public static final EXTRA_LIVE_FOLDER_BASE_INTENT:Ljava/lang/String; = "android.intent.extra.livefolder.BASE_INTENT"

.field public static final EXTRA_LIVE_FOLDER_DISPLAY_MODE:Ljava/lang/String; = "android.intent.extra.livefolder.DISPLAY_MODE"

.field public static final EXTRA_LIVE_FOLDER_ICON:Ljava/lang/String; = "android.intent.extra.livefolder.ICON"

.field public static final EXTRA_LIVE_FOLDER_NAME:Ljava/lang/String; = "android.intent.extra.livefolder.NAME"

.field public static final ICON_BITMAP:Ljava/lang/String; = "icon_bitmap"

.field public static final ICON_PACKAGE:Ljava/lang/String; = "icon_package"

.field public static final ICON_RESOURCE:Ljava/lang/String; = "icon_resource"

.field public static final INTENT:Ljava/lang/String; = "intent"

.field public static final NAME:Ljava/lang/String; = "name"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
