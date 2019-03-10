.class public final Landroid/system/StructStatVfs;
.super Ljava/lang/Object;
.source "StructStatVfs.java"


# instance fields
.field public final f_bavail:J

.field public final f_bfree:J

.field public final f_blocks:J

.field public final f_bsize:J

.field public final f_favail:J

.field public final f_ffree:J

.field public final f_files:J

.field public final f_flag:J

.field public final f_frsize:J

.field public final f_fsid:J

.field public final f_namemax:J


# direct methods
.method public constructor <init>(JJJJJJJJJJJ)V
    .locals 2
    .param p1, "f_bsize"    # J
    .param p3, "f_frsize"    # J
    .param p5, "f_blocks"    # J
    .param p7, "f_bfree"    # J
    .param p9, "f_bavail"    # J
    .param p11, "f_files"    # J
    .param p13, "f_ffree"    # J
    .param p15, "f_favail"    # J
    .param p17, "f_fsid"    # J
    .param p19, "f_flag"    # J
    .param p21, "f_namemax"    # J

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public toString()Ljava/lang/String;
    .locals 2

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
