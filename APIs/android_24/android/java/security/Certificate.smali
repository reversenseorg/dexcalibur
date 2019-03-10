.class public interface abstract Ljava/security/Certificate;
.super Ljava/lang/Object;
.source "Certificate.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract decode(Ljava/io/InputStream;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/KeyException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract encode(Ljava/io/OutputStream;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/KeyException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract getFormat()Ljava/lang/String;
.end method

.method public abstract getGuarantor()Ljava/security/Principal;
.end method

.method public abstract getPrincipal()Ljava/security/Principal;
.end method

.method public abstract getPublicKey()Ljava/security/PublicKey;
.end method

.method public abstract toString(Z)Ljava/lang/String;
.end method
