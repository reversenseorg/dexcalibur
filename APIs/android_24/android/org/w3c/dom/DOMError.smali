.class public interface abstract Lorg/w3c/dom/DOMError;
.super Ljava/lang/Object;
.source "DOMError.java"


# static fields
.field public static final SEVERITY_ERROR:S = 0x2s

.field public static final SEVERITY_FATAL_ERROR:S = 0x3s

.field public static final SEVERITY_WARNING:S = 0x1s


# virtual methods
.method public abstract getLocation()Lorg/w3c/dom/DOMLocator;
.end method

.method public abstract getMessage()Ljava/lang/String;
.end method

.method public abstract getRelatedData()Ljava/lang/Object;
.end method

.method public abstract getRelatedException()Ljava/lang/Object;
.end method

.method public abstract getSeverity()S
.end method

.method public abstract getType()Ljava/lang/String;
.end method
