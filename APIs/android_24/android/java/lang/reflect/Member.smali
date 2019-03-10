.class public interface abstract Ljava/lang/reflect/Member;
.super Ljava/lang/Object;
.source "Member.java"


# static fields
.field public static final DECLARED:I = 0x1

.field public static final PUBLIC:I


# virtual methods
.method public abstract getDeclaringClass()Ljava/lang/Class;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/lang/Class",
            "<*>;"
        }
    .end annotation
.end method

.method public abstract getModifiers()I
.end method

.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract isSynthetic()Z
.end method
