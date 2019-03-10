.class public interface abstract Lorg/apache/http/conn/scheme/HostNameResolver;
.super Ljava/lang/Object;
.source "HostNameResolver.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# virtual methods
.method public abstract resolve(Ljava/lang/String;)Ljava/net/InetAddress;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
