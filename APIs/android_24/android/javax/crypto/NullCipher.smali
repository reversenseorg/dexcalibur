.class public Ljavax/crypto/NullCipher;
.super Ljavax/crypto/Cipher;
.source "NullCipher.java"


# direct methods
.method public constructor <init>()V
    .locals 3

    .prologue
    const/4 v1, 0x0

    .line 5
    move-object v0, v1

    check-cast v0, Ljavax/crypto/CipherSpi;

    move-object v2, v1

    check-cast v2, Ljava/security/Provider;

    check-cast v1, Ljava/lang/String;

    invoke-direct {p0, v0, v2, v1}, Ljavax/crypto/Cipher;-><init>(Ljavax/crypto/CipherSpi;Ljava/security/Provider;Ljava/lang/String;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
