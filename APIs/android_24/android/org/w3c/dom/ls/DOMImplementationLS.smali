.class public interface abstract Lorg/w3c/dom/ls/DOMImplementationLS;
.super Ljava/lang/Object;
.source "DOMImplementationLS.java"


# static fields
.field public static final MODE_ASYNCHRONOUS:S = 0x2s

.field public static final MODE_SYNCHRONOUS:S = 0x1s


# virtual methods
.method public abstract createLSInput()Lorg/w3c/dom/ls/LSInput;
.end method

.method public abstract createLSOutput()Lorg/w3c/dom/ls/LSOutput;
.end method

.method public abstract createLSParser(SLjava/lang/String;)Lorg/w3c/dom/ls/LSParser;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createLSSerializer()Lorg/w3c/dom/ls/LSSerializer;
.end method
