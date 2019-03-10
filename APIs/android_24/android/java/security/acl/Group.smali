.class public interface abstract Ljava/security/acl/Group;
.super Ljava/lang/Object;
.source "Group.java"

# interfaces
.implements Ljava/security/Principal;


# virtual methods
.method public abstract addMember(Ljava/security/Principal;)Z
.end method

.method public abstract isMember(Ljava/security/Principal;)Z
.end method

.method public abstract members()Ljava/util/Enumeration;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Enumeration",
            "<+",
            "Ljava/security/Principal;",
            ">;"
        }
    .end annotation
.end method

.method public abstract removeMember(Ljava/security/Principal;)Z
.end method
