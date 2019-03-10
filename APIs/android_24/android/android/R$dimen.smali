.class public final Landroid/R$dimen;
.super Ljava/lang/Object;
.source "R.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/R;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "dimen"
.end annotation


# static fields
.field public static final app_icon_size:I = 0x1050000

.field public static final dialog_min_width_major:I = 0x1050003

.field public static final dialog_min_width_minor:I = 0x1050004

.field public static final notification_large_icon_height:I = 0x1050006

.field public static final notification_large_icon_width:I = 0x1050005

.field public static final thumbnail_height:I = 0x1050001

.field public static final thumbnail_width:I = 0x1050002


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 1294
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
