.class public interface abstract Lorg/apache/http/io/HttpMessageParser;
.super Ljava/lang/Object;
.source "HttpMessageParser.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract parse()Lorg/apache/http/HttpMessage;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;,
            Lorg/apache/http/HttpException;
        }
    .end annotation
.end method
