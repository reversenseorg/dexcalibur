.class public final Landroid/system/StructStat;
.super Ljava/lang/Object;
.source "StructStat.java"


# instance fields
.field public final st_atime:J

.field public final st_blksize:J

.field public final st_blocks:J

.field public final st_ctime:J

.field public final st_dev:J

.field public final st_gid:I

.field public final st_ino:J

.field public final st_mode:I

.field public final st_mtime:J

.field public final st_nlink:J

.field public final st_rdev:J

.field public final st_size:J

.field public final st_uid:I


# direct methods
.method public constructor <init>(JJIJIIJJJJJJJ)V
    .locals 2
    .param p1, "st_dev"    # J
    .param p3, "st_ino"    # J
    .param p5, "st_mode"    # I
    .param p6, "st_nlink"    # J
    .param p8, "st_uid"    # I
    .param p9, "st_gid"    # I
    .param p10, "st_rdev"    # J
    .param p12, "st_size"    # J
    .param p14, "st_atime"    # J
    .param p16, "st_mtime"    # J
    .param p18, "st_ctime"    # J
    .param p20, "st_blksize"    # J
    .param p22, "st_blocks"    # J

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
