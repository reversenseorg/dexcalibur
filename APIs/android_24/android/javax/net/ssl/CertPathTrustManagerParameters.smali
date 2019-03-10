.class public Ljavax/net/ssl/CertPathTrustManagerParameters;
.super Ljava/lang/Object;
.source "CertPathTrustManagerParameters.java"

# interfaces
.implements Ljavax/net/ssl/ManagerFactoryParameters;


# direct methods
.method public constructor <init>(Ljava/security/cert/CertPathParameters;)V
    .locals 2
    .param p1, "parameters"    # Ljava/security/cert/CertPathParameters;

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getParameters()Ljava/security/cert/CertPathParameters;
    .locals 2

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
