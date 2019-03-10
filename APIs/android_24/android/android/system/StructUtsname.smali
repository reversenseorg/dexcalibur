.class public final Landroid/system/StructUtsname;
.super Ljava/lang/Object;
.source "StructUtsname.java"


# instance fields
.field public final machine:Ljava/lang/String;

.field public final nodename:Ljava/lang/String;

.field public final release:Ljava/lang/String;

.field public final sysname:Ljava/lang/String;

.field public final version:Ljava/lang/String;


# direct methods
.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
    .locals 2
    .param p1, "sysname"    # Ljava/lang/String;
    .param p2, "nodename"    # Ljava/lang/String;
    .param p3, "release"    # Ljava/lang/String;
    .param p4, "version"    # Ljava/lang/String;
    .param p5, "machine"    # Ljava/lang/String;

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
