.class public interface abstract Lorg/apache/http/client/CredentialsProvider;
.super Ljava/lang/Object;
.source "CredentialsProvider.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract clear()V
.end method

.method public abstract getCredentials(Lorg/apache/http/auth/AuthScope;)Lorg/apache/http/auth/Credentials;
.end method

.method public abstract setCredentials(Lorg/apache/http/auth/AuthScope;Lorg/apache/http/auth/Credentials;)V
.end method
