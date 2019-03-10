.class public Ljava/security/cert/PKIXCertPathBuilderResult;
.super Ljava/security/cert/PKIXCertPathValidatorResult;
.source "PKIXCertPathBuilderResult.java"

# interfaces
.implements Ljava/security/cert/CertPathBuilderResult;


# direct methods
.method public constructor <init>(Ljava/security/cert/CertPath;Ljava/security/cert/TrustAnchor;Ljava/security/cert/PolicyNode;Ljava/security/PublicKey;)V
    .locals 3
    .param p1, "certPath"    # Ljava/security/cert/CertPath;
    .param p2, "trustAnchor"    # Ljava/security/cert/TrustAnchor;
    .param p3, "policyTree"    # Ljava/security/cert/PolicyNode;
    .param p4, "subjectPublicKey"    # Ljava/security/PublicKey;

    .prologue
    const/4 v1, 0x0

    .line 6
    move-object v0, v1

    check-cast v0, Ljava/security/cert/TrustAnchor;

    move-object v2, v1

    check-cast v2, Ljava/security/cert/PolicyNode;

    check-cast v1, Ljava/security/PublicKey;

    invoke-direct {p0, v0, v2, v1}, Ljava/security/cert/PKIXCertPathValidatorResult;-><init>(Ljava/security/cert/TrustAnchor;Ljava/security/cert/PolicyNode;Ljava/security/PublicKey;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getCertPath()Ljava/security/cert/CertPath;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toString()Ljava/lang/String;
    .locals 2

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
