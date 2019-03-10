.class public interface abstract Lorg/apache/http/client/CookieStore;
.super Ljava/lang/Object;
.source "CookieStore.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract addCookie(Lorg/apache/http/cookie/Cookie;)V
.end method

.method public abstract clear()V
.end method

.method public abstract clearExpired(Ljava/util/Date;)Z
.end method

.method public abstract getCookies()Ljava/util/List;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List",
            "<",
            "Lorg/apache/http/cookie/Cookie;",
            ">;"
        }
    .end annotation
.end method
