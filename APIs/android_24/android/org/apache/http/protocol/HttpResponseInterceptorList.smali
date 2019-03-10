.class public interface abstract Lorg/apache/http/protocol/HttpResponseInterceptorList;
.super Ljava/lang/Object;
.source "HttpResponseInterceptorList.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract addResponseInterceptor(Lorg/apache/http/HttpResponseInterceptor;)V
.end method

.method public abstract addResponseInterceptor(Lorg/apache/http/HttpResponseInterceptor;I)V
.end method

.method public abstract clearResponseInterceptors()V
.end method

.method public abstract getResponseInterceptor(I)Lorg/apache/http/HttpResponseInterceptor;
.end method

.method public abstract getResponseInterceptorCount()I
.end method

.method public abstract removeResponseInterceptorByClass(Ljava/lang/Class;)V
.end method

.method public abstract setInterceptors(Ljava/util/List;)V
.end method
