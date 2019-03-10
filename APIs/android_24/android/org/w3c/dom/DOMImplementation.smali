.class public interface abstract Lorg/w3c/dom/DOMImplementation;
.super Ljava/lang/Object;
.source "DOMImplementation.java"


# virtual methods
.method public abstract createDocument(Ljava/lang/String;Ljava/lang/String;Lorg/w3c/dom/DocumentType;)Lorg/w3c/dom/Document;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createDocumentType(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/DocumentType;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract getFeature(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract hasFeature(Ljava/lang/String;Ljava/lang/String;)Z
.end method
