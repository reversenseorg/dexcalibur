.class public abstract Landroid/webkit/ClientCertRequest;
.super Ljava/lang/Object;
.source "ClientCertRequest.java"


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
.method public abstract cancel()V
.end method

.method public abstract getHost()Ljava/lang/String;
.end method

.method public abstract getKeyTypes()[Ljava/lang/String;
.end method

.method public abstract getPort()I
.end method

.method public abstract getPrincipals()[Ljava/security/Principal;
.end method

.method public abstract ignore()V
.end method

.method public abstract proceed(Ljava/security/PrivateKey;[Ljava/security/cert/X509Certificate;)V
.end method
