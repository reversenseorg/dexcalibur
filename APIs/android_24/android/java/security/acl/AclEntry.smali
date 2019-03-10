.class public interface abstract Ljava/security/acl/AclEntry;
.super Ljava/lang/Object;
.source "AclEntry.java"

# interfaces
.implements Ljava/lang/Cloneable;


# virtual methods
.method public abstract addPermission(Ljava/security/acl/Permission;)Z
.end method

.method public abstract checkPermission(Ljava/security/acl/Permission;)Z
.end method

.method public abstract clone()Ljava/lang/Object;
.end method

.method public abstract getPrincipal()Ljava/security/Principal;
.end method

.method public abstract isNegative()Z
.end method

.method public abstract permissions()Ljava/util/Enumeration;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Enumeration",
            "<",
            "Ljava/security/acl/Permission;",
            ">;"
        }
    .end annotation
.end method

.method public abstract removePermission(Ljava/security/acl/Permission;)Z
.end method

.method public abstract setNegativePermissions()V
.end method

.method public abstract setPrincipal(Ljava/security/Principal;)Z
.end method

.method public abstract toString()Ljava/lang/String;
.end method
