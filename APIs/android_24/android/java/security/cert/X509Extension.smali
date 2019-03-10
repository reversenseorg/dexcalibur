.class public interface abstract Ljava/security/cert/X509Extension;
.super Ljava/lang/Object;
.source "X509Extension.java"


# virtual methods
.method public abstract getCriticalExtensionOIDs()Ljava/util/Set;
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

.method public abstract getExtensionValue(Ljava/lang/String;)[B
.end method

.method public abstract getNonCriticalExtensionOIDs()Ljava/util/Set;
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

.method public abstract hasUnsupportedCriticalExtension()Z
.end method
