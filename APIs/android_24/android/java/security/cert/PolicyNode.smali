.class public interface abstract Ljava/security/cert/PolicyNode;
.super Ljava/lang/Object;
.source "PolicyNode.java"


# virtual methods
.method public abstract getChildren()Ljava/util/Iterator;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Iterator",
            "<+",
            "Ljava/security/cert/PolicyNode;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getDepth()I
.end method

.method public abstract getExpectedPolicies()Ljava/util/Set;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Set",
            "<",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getParent()Ljava/security/cert/PolicyNode;
.end method

.method public abstract getPolicyQualifiers()Ljava/util/Set;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Set",
            "<+",
            "Ljava/security/cert/PolicyQualifierInfo;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getValidPolicy()Ljava/lang/String;
.end method

.method public abstract isCritical()Z
.end method
