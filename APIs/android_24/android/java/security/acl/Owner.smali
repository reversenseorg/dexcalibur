.class public interface abstract Ljava/security/acl/Owner;
.super Ljava/lang/Object;
.source "Owner.java"


# virtual methods
.method public abstract addOwner(Ljava/security/Principal;Ljava/security/Principal;)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/acl/NotOwnerException;
        }
    .end annotation
.end method

.method public abstract deleteOwner(Ljava/security/Principal;Ljava/security/Principal;)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/acl/NotOwnerException;,
            Ljava/security/acl/LastOwnerException;
        }
    .end annotation
.end method

.method public abstract isOwner(Ljava/security/Principal;)Z
.end method
