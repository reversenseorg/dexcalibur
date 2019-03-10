.class public abstract Ljavax/crypto/KeyGeneratorSpi;
.super Ljava/lang/Object;
.source "KeyGeneratorSpi.java"


# direct methods
.method public constructor <init>()V
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
.method protected abstract engineGenerateKey()Ljavax/crypto/SecretKey;
.end method

.method protected abstract engineInit(ILjava/security/SecureRandom;)V
.end method

.method protected abstract engineInit(Ljava/security/SecureRandom;)V
.end method

.method protected abstract engineInit(Ljava/security/spec/AlgorithmParameterSpec;Ljava/security/SecureRandom;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/InvalidAlgorithmParameterException;
        }
    .end annotation
.end method
