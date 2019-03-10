.class public interface abstract Lorg/apache/http/io/HttpMessageWriter;
.super Ljava/lang/Object;
.source "HttpMessageWriter.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract write(Lorg/apache/http/HttpMessage;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;,
            Lorg/apache/http/HttpException;
        }
    .end annotation
.end method
