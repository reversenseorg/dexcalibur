.class public interface abstract Lorg/apache/http/HttpResponse;
.super Ljava/lang/Object;
.source "HttpResponse.java"

# interfaces
.implements Lorg/apache/http/HttpMessage;


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract getEntity()Lorg/apache/http/HttpEntity;
.end method

.method public abstract getLocale()Ljava/util/Locale;
.end method

.method public abstract getStatusLine()Lorg/apache/http/StatusLine;
.end method

.method public abstract setEntity(Lorg/apache/http/HttpEntity;)V
.end method

.method public abstract setLocale(Ljava/util/Locale;)V
.end method

.method public abstract setReasonPhrase(Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/IllegalStateException;
        }
    .end annotation
.end method

.method public abstract setStatusCode(I)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/IllegalStateException;
        }
    .end annotation
.end method

.method public abstract setStatusLine(Lorg/apache/http/ProtocolVersion;I)V
.end method

.method public abstract setStatusLine(Lorg/apache/http/ProtocolVersion;ILjava/lang/String;)V
.end method

.method public abstract setStatusLine(Lorg/apache/http/StatusLine;)V
.end method
