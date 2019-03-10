.class public interface abstract Ljava/security/interfaces/RSAMultiPrimePrivateCrtKey;
.super Ljava/lang/Object;
.source "RSAMultiPrimePrivateCrtKey.java"

# interfaces
.implements Ljava/security/interfaces/RSAPrivateKey;


# static fields
.field public static final serialVersionUID:J = 0x893c8f62dbaf8a8L


# virtual methods
.method public abstract getCrtCoefficient()Ljava/math/BigInteger;
.end method

.method public abstract getOtherPrimeInfo()[Ljava/security/spec/RSAOtherPrimeInfo;
.end method

.method public abstract getPrimeExponentP()Ljava/math/BigInteger;
.end method

.method public abstract getPrimeExponentQ()Ljava/math/BigInteger;
.end method

.method public abstract getPrimeP()Ljava/math/BigInteger;
.end method

.method public abstract getPrimeQ()Ljava/math/BigInteger;
.end method

.method public abstract getPublicExponent()Ljava/math/BigInteger;
.end method
