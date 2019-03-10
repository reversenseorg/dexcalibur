.class public interface abstract Lorg/apache/http/conn/ssl/X509HostnameVerifier;
.super Ljava/lang/Object;
.source "X509HostnameVerifier.java"

# interfaces
.implements Ljavax/net/ssl/HostnameVerifier;


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract verify(Ljava/lang/String;Ljava/security/cert/X509Certificate;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/net/ssl/SSLException;
        }
    .end annotation
.end method

.method public abstract verify(Ljava/lang/String;Ljavax/net/ssl/SSLSocket;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract verify(Ljava/lang/String;[Ljava/lang/String;[Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/net/ssl/SSLException;
        }
    .end annotation
.end method

.method public abstract verify(Ljava/lang/String;Ljavax/net/ssl/SSLSession;)Z
.end method
