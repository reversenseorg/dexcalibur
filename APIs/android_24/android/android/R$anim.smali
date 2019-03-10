.class public final Landroid/R$anim;
.super Ljava/lang/Object;
.source "R.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/R;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "anim"
.end annotation


# static fields
.field public static final accelerate_decelerate_interpolator:I = 0x10a0004

.field public static final accelerate_interpolator:I = 0x10a0005

.field public static final anticipate_interpolator:I = 0x10a0007

.field public static final anticipate_overshoot_interpolator:I = 0x10a0009

.field public static final bounce_interpolator:I = 0x10a000a

.field public static final cycle_interpolator:I = 0x10a000c

.field public static final decelerate_interpolator:I = 0x10a0006

.field public static final fade_in:I = 0x10a0000

.field public static final fade_out:I = 0x10a0001

.field public static final linear_interpolator:I = 0x10a000b

.field public static final overshoot_interpolator:I = 0x10a0008

.field public static final slide_in_left:I = 0x10a0002

.field public static final slide_out_right:I = 0x10a0003


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
