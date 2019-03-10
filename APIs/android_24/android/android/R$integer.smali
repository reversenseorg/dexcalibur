.class public final Landroid/R$integer;
.super Ljava/lang/Object;
.source "R.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/R;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "integer"
.end annotation


# static fields
.field public static final config_longAnimTime:I = 0x10e0002

.field public static final config_mediumAnimTime:I = 0x10e0001

.field public static final config_shortAnimTime:I = 0x10e0000

.field public static final status_bar_notification_info_maxnum:I = 0x10e0003


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 1545
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
