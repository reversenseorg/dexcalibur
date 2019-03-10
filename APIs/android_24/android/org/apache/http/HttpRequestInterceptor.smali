.class public interface abstract Lorg/apache/http/HttpRequestInterceptor;
.super Ljava/lang/Object;
.source "HttpRequestInterceptor.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract process(Lorg/apache/http/HttpRequest;Lorg/apache/http/protocol/HttpContext;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/apache/http/HttpException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method
