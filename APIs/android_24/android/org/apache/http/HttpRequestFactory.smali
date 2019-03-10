.class public interface abstract Lorg/apache/http/HttpRequestFactory;
.super Ljava/lang/Object;
.source "HttpRequestFactory.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract newHttpRequest(Ljava/lang/String;Ljava/lang/String;)Lorg/apache/http/HttpRequest;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/apache/http/MethodNotSupportedException;
        }
    .end annotation
.end method

.method public abstract newHttpRequest(Lorg/apache/http/RequestLine;)Lorg/apache/http/HttpRequest;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/apache/http/MethodNotSupportedException;
        }
    .end annotation
.end method
