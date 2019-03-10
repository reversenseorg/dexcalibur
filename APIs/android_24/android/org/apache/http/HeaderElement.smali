.class public interface abstract Lorg/apache/http/HeaderElement;
.super Ljava/lang/Object;
.source "HeaderElement.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract getParameter(I)Lorg/apache/http/NameValuePair;
.end method

.method public abstract getParameterByName(Ljava/lang/String;)Lorg/apache/http/NameValuePair;
.end method

.method public abstract getParameterCount()I
.end method

.method public abstract getParameters()[Lorg/apache/http/NameValuePair;
.end method

.method public abstract getValue()Ljava/lang/String;
.end method
