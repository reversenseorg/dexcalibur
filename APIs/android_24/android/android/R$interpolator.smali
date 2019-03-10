.class public final Landroid/R$interpolator;
.super Ljava/lang/Object;
.source "R.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/R;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "interpolator"
.end annotation


# static fields
.field public static final accelerate_cubic:I = 0x10c0002

.field public static final accelerate_decelerate:I = 0x10c0006

.field public static final accelerate_quad:I = 0x10c0000

.field public static final accelerate_quint:I = 0x10c0004

.field public static final anticipate:I = 0x10c0007

.field public static final anticipate_overshoot:I = 0x10c0009

.field public static final bounce:I = 0x10c000a

.field public static final cycle:I = 0x10c000c

.field public static final decelerate_cubic:I = 0x10c0003

.field public static final decelerate_quad:I = 0x10c0001

.field public static final decelerate_quint:I = 0x10c0005

.field public static final fast_out_linear_in:I = 0x10c000f

.field public static final fast_out_slow_in:I = 0x10c000d

.field public static final linear:I = 0x10c000b

.field public static final linear_out_slow_in:I = 0x10c000e

.field public static final overshoot:I = 0x10c0008


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 1553
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
