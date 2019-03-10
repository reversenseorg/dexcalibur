.class public abstract Ljava/security/SecureRandomSpi;
.super Ljava/lang/Object;
.source "SecureRandomSpi.java"

# interfaces
.implements Ljava/io/Serializable;


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method protected abstract engineGenerateSeed(I)[B
.end method

.method protected abstract engineNextBytes([B)V
.end method

.method protected abstract engineSetSeed([B)V
.end method
