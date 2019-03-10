.class public interface abstract Ljava/security/acl/Acl;
.super Ljava/lang/Object;
.source "Acl.java"

# interfaces
.implements Ljava/security/acl/Owner;


# virtual methods
.method public abstract addEntry(Ljava/security/Principal;Ljava/security/acl/AclEntry;)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/acl/NotOwnerException;
        }
    .end annotation
.end method

.method public abstract checkPermission(Ljava/security/Principal;Ljava/security/acl/Permission;)Z
.end method

.method public abstract entries()Ljava/util/Enumeration;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Enumeration",
            "<",
            "Ljava/security/acl/AclEntry;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract getPermissions(Ljava/security/Principal;)Ljava/util/Enumeration;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/security/Principal;",
            ")",
            "Ljava/util/Enumeration",
            "<",
            "Ljava/security/acl/Permission;",
            ">;"
        }
    .end annotation
.end method

.method public abstract removeEntry(Ljava/security/Principal;Ljava/security/acl/AclEntry;)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/acl/NotOwnerException;
        }
    .end annotation
.end method

.method public abstract setName(Ljava/security/Principal;Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/security/acl/NotOwnerException;
        }
    .end annotation
.end method

.method public abstract toString()Ljava/lang/String;
.end method
