.class public interface abstract Lorg/apache/http/HttpMessage;
.super Ljava/lang/Object;
.source "HttpMessage.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract addHeader(Ljava/lang/String;Ljava/lang/String;)V
.end method

.method public abstract addHeader(Lorg/apache/http/Header;)V
.end method

.method public abstract containsHeader(Ljava/lang/String;)Z
.end method

.method public abstract getAllHeaders()[Lorg/apache/http/Header;
.end method

.method public abstract getFirstHeader(Ljava/lang/String;)Lorg/apache/http/Header;
.end method

.method public abstract getHeaders(Ljava/lang/String;)[Lorg/apache/http/Header;
.end method

.method public abstract getLastHeader(Ljava/lang/String;)Lorg/apache/http/Header;
.end method

.method public abstract getParams()Lorg/apache/http/params/HttpParams;
.end method

.method public abstract getProtocolVersion()Lorg/apache/http/ProtocolVersion;
.end method

.method public abstract headerIterator()Lorg/apache/http/HeaderIterator;
.end method

.method public abstract headerIterator(Ljava/lang/String;)Lorg/apache/http/HeaderIterator;
.end method

.method public abstract removeHeader(Lorg/apache/http/Header;)V
.end method

.method public abstract removeHeaders(Ljava/lang/String;)V
.end method

.method public abstract setHeader(Ljava/lang/String;Ljava/lang/String;)V
.end method

.method public abstract setHeader(Lorg/apache/http/Header;)V
.end method

.method public abstract setHeaders([Lorg/apache/http/Header;)V
.end method

.method public abstract setParams(Lorg/apache/http/params/HttpParams;)V
.end method
