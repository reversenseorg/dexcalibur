.class public interface abstract Lorg/apache/http/params/HttpParams;
.super Ljava/lang/Object;
.source "HttpParams.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract copy()Lorg/apache/http/params/HttpParams;
.end method

.method public abstract getBooleanParameter(Ljava/lang/String;Z)Z
.end method

.method public abstract getDoubleParameter(Ljava/lang/String;D)D
.end method

.method public abstract getIntParameter(Ljava/lang/String;I)I
.end method

.method public abstract getLongParameter(Ljava/lang/String;J)J
.end method

.method public abstract getParameter(Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract isParameterFalse(Ljava/lang/String;)Z
.end method

.method public abstract isParameterTrue(Ljava/lang/String;)Z
.end method

.method public abstract removeParameter(Ljava/lang/String;)Z
.end method

.method public abstract setBooleanParameter(Ljava/lang/String;Z)Lorg/apache/http/params/HttpParams;
.end method

.method public abstract setDoubleParameter(Ljava/lang/String;D)Lorg/apache/http/params/HttpParams;
.end method

.method public abstract setIntParameter(Ljava/lang/String;I)Lorg/apache/http/params/HttpParams;
.end method

.method public abstract setLongParameter(Ljava/lang/String;J)Lorg/apache/http/params/HttpParams;
.end method

.method public abstract setParameter(Ljava/lang/String;Ljava/lang/Object;)Lorg/apache/http/params/HttpParams;
.end method
