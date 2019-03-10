.class public interface abstract Lorg/w3c/dom/NamedNodeMap;
.super Ljava/lang/Object;
.source "NamedNodeMap.java"


# virtual methods
.method public abstract getLength()I
.end method

.method public abstract getNamedItem(Ljava/lang/String;)Lorg/w3c/dom/Node;
.end method

.method public abstract getNamedItemNS(Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract item(I)Lorg/w3c/dom/Node;
.end method

.method public abstract removeNamedItem(Ljava/lang/String;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract removeNamedItemNS(Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract setNamedItem(Lorg/w3c/dom/Node;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract setNamedItemNS(Lorg/w3c/dom/Node;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method
