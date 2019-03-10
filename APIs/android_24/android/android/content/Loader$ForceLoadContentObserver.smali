.class public final Landroid/content/Loader$ForceLoadContentObserver;
.super Landroid/database/ContentObserver;
.source "Loader.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/content/Loader;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x11
    name = "ForceLoadContentObserver"
.end annotation


# instance fields
.field final synthetic this$0:Landroid/content/Loader;


# direct methods
.method public constructor <init>(Landroid/content/Loader;)V
    .locals 2

    .prologue
    .line 7
    .local p0, "this":Landroid/content/Loader$ForceLoadContentObserver;, "Landroid/content/Loader<TD;>.ForceLoadContentObserver;"
    iput-object p1, p0, Landroid/content/Loader$ForceLoadContentObserver;->this$0:Landroid/content/Loader;

    const/4 v0, 0x0

    check-cast v0, Landroid/os/Handler;

    invoke-direct {p0, v0}, Landroid/database/ContentObserver;-><init>(Landroid/os/Handler;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public deliverSelfNotifications()Z
    .locals 2

    .prologue
    .line 8
    .local p0, "this":Landroid/content/Loader$ForceLoadContentObserver;, "Landroid/content/Loader<TD;>.ForceLoadContentObserver;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public onChange(Z)V
    .locals 2
    .param p1, "selfChange"    # Z

    .prologue
    .line 9
    .local p0, "this":Landroid/content/Loader$ForceLoadContentObserver;, "Landroid/content/Loader<TD;>.ForceLoadContentObserver;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
