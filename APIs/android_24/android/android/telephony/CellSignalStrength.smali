.class public abstract Landroid/telephony/CellSignalStrength;
.super Ljava/lang/Object;
.source "CellSignalStrength.java"


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


# virtual methods
.method public abstract equals(Ljava/lang/Object;)Z
.end method

.method public abstract getAsuLevel()I
.end method

.method public abstract getDbm()I
.end method

.method public abstract getLevel()I
.end method

.method public abstract hashCode()I
.end method
