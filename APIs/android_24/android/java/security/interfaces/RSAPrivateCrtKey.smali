.class public interface abstract Ljava/security/interfaces/RSAPrivateCrtKey;
.super Ljava/lang/Object;
.source "RSAPrivateCrtKey.java"

# interfaces
.implements Ljava/security/interfaces/RSAPrivateKey;


# static fields
.field public static final serialVersionUID:J = -0x4edb47c2072e1390L


# virtual methods
.method public abstract getCrtCoefficient()Ljava/math/BigInteger;
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
