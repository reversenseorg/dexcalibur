.class public final Ljava/security/AccessControlContext;
.super Ljava/lang/Object;
.source "AccessControlContext.java"


# direct methods
.method public constructor <init>(Ljava/security/AccessControlContext;Ljava/security/DomainCombiner;)V
    .locals 2
    .param p1, "acc"    # Ljava/security/AccessControlContext;
    .param p2, "combiner"    # Ljava/security/DomainCombiner;

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>([Ljava/security/ProtectionDomain;)V
    .locals 2
    .param p1, "context"    # [Ljava/security/ProtectionDomain;

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public checkPermission(Ljava/security/Permission;)V
    .locals 2
    .param p1, "perm"    # Ljava/security/Permission;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/AccessControlException;
        }
    .end annotation

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getDomainCombiner()Ljava/security/DomainCombiner;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
