.class public final Landroid/R$transition;
.super Ljava/lang/Object;
.source "R.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/R;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "transition"
.end annotation


# static fields
.field public static final explode:I = 0x10f0003

.field public static final fade:I = 0x10f0002

.field public static final move:I = 0x10f0001

.field public static final no_transition:I = 0x10f0000

.field public static final slide_bottom:I = 0x10f0004

.field public static final slide_left:I = 0x10f0007

.field public static final slide_right:I = 0x10f0006

.field public static final slide_top:I = 0x10f0005


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 2378
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
