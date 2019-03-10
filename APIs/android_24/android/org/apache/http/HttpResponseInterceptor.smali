.class public interface abstract Lorg/apache/http/HttpResponseInterceptor;
.super Ljava/lang/Object;
.source "HttpResponseInterceptor.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract process(Lorg/apache/http/HttpResponse;Lorg/apache/http/protocol/HttpContext;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/apache/http/HttpException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method
