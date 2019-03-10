.class public interface abstract Lorg/apache/http/cookie/Cookie;
.super Ljava/lang/Object;
.source "Cookie.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getComment()Ljava/lang/String;
.end method

.method public abstract getCommentURL()Ljava/lang/String;
.end method

.method public abstract getDomain()Ljava/lang/String;
.end method

.method public abstract getExpiryDate()Ljava/util/Date;
.end method

.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract getPath()Ljava/lang/String;
.end method

.method public abstract getPorts()[I
.end method

.method public abstract getValue()Ljava/lang/String;
.end method

.method public abstract getVersion()I
.end method

.method public abstract isExpired(Ljava/util/Date;)Z
.end method

.method public abstract isPersistent()Z
.end method

.method public abstract isSecure()Z
.end method
