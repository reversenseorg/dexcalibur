.class public final Landroid/util/LayoutDirection;
.super Ljava/lang/Object;
.source "LayoutDirection.java"


# static fields
.field public static final INHERIT:I = 0x2

.field public static final LOCALE:I = 0x3

.field public static final LTR:I = 0x0

.field public static final RTL:I = 0x1


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
