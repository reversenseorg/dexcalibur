.class public Landroid/view/animation/GridLayoutAnimationController$AnimationParameters;
.super Landroid/view/animation/LayoutAnimationController$AnimationParameters;
.source "GridLayoutAnimationController.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/view/animation/GridLayoutAnimationController;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "AnimationParameters"
.end annotation


# instance fields
.field public column:I

.field public columnsCount:I

.field public row:I

.field public rowsCount:I


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 8
    invoke-direct {p0}, Landroid/view/animation/LayoutAnimationController$AnimationParameters;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
