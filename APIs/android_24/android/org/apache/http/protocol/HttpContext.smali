.class public interface abstract Lorg/apache/http/protocol/HttpContext;
.super Ljava/lang/Object;
.source "HttpContext.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final RESERVED_PREFIX:Ljava/lang/String; = "http."


# virtual methods
.method public abstract getAttribute(Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract removeAttribute(Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract setAttribute(Ljava/lang/String;Ljava/lang/Object;)V
.end method
