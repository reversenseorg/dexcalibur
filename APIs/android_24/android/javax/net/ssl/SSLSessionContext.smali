.class public interface abstract Ljavax/net/ssl/SSLSessionContext;
.super Ljava/lang/Object;
.source "SSLSessionContext.java"


# virtual methods
.method public abstract getIds()Ljava/util/Enumeration;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Enumeration",
            "<[B>;"
        }
    .end annotation
.end method

.method public abstract getSession([B)Ljavax/net/ssl/SSLSession;
.end method

.method public abstract getSessionCacheSize()I
.end method

.method public abstract getSessionTimeout()I
.end method

.method public abstract setSessionCacheSize(I)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/IllegalArgumentException;
        }
    .end annotation
.end method

.method public abstract setSessionTimeout(I)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/IllegalArgumentException;
        }
    .end annotation
.end method
