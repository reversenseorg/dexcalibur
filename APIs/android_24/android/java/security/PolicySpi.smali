.class public abstract Ljava/security/PolicySpi;
.super Ljava/lang/Object;
.source "PolicySpi.java"


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
.method protected engineGetPermissions(Ljava/security/CodeSource;)Ljava/security/PermissionCollection;
    .locals 2
    .param p1, "codesource"    # Ljava/security/CodeSource;

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected engineGetPermissions(Ljava/security/ProtectionDomain;)Ljava/security/PermissionCollection;
    .locals 2
    .param p1, "domain"    # Ljava/security/ProtectionDomain;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected abstract engineImplies(Ljava/security/ProtectionDomain;Ljava/security/Permission;)Z
.end method

.method protected engineRefresh()V
    .locals 2

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
