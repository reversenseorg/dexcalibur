.class public interface abstract Ljavax/net/ssl/SSLSession;
.super Ljava/lang/Object;
.source "SSLSession.java"


# virtual methods
.method public abstract getApplicationBufferSize()I
.end method

.method public abstract getCipherSuite()Ljava/lang/String;
.end method

.method public abstract getCreationTime()J
.end method

.method public abstract getId()[B
.end method

.method public abstract getLastAccessedTime()J
.end method

.method public abstract getLocalCertificates()[Ljava/security/cert/Certificate;
.end method

.method public abstract getLocalPrincipal()Ljava/security/Principal;
.end method

.method public abstract getPacketBufferSize()I
.end method

.method public abstract getPeerCertificateChain()[Ljavax/security/cert/X509Certificate;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/net/ssl/SSLPeerUnverifiedException;
        }
    .end annotation
.end method

.method public abstract getPeerCertificates()[Ljava/security/cert/Certificate;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/net/ssl/SSLPeerUnverifiedException;
        }
    .end annotation
.end method

.method public abstract getPeerHost()Ljava/lang/String;
.end method

.method public abstract getPeerPort()I
.end method

.method public abstract getPeerPrincipal()Ljava/security/Principal;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/net/ssl/SSLPeerUnverifiedException;
        }
    .end annotation
.end method

.method public abstract getProtocol()Ljava/lang/String;
.end method

.method public abstract getSessionContext()Ljavax/net/ssl/SSLSessionContext;
.end method

.method public abstract getValue(Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract getValueNames()[Ljava/lang/String;
.end method

.method public abstract invalidate()V
.end method

.method public abstract isValid()Z
.end method

.method public abstract putValue(Ljava/lang/String;Ljava/lang/Object;)V
.end method

.method public abstract removeValue(Ljava/lang/String;)V
.end method
