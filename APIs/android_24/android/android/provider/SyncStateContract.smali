.class public Landroid/provider/SyncStateContract;
.super Ljava/lang/Object;
.source "SyncStateContract.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/provider/SyncStateContract$Helpers;,
        Landroid/provider/SyncStateContract$Constants;,
        Landroid/provider/SyncStateContract$Columns;
    }
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 28
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
