.class public interface abstract Lorg/w3c/dom/Document;
.super Ljava/lang/Object;
.source "Document.java"

# interfaces
.implements Lorg/w3c/dom/Node;


# virtual methods
.method public abstract adoptNode(Lorg/w3c/dom/Node;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createAttribute(Ljava/lang/String;)Lorg/w3c/dom/Attr;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createAttributeNS(Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/Attr;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createCDATASection(Ljava/lang/String;)Lorg/w3c/dom/CDATASection;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createComment(Ljava/lang/String;)Lorg/w3c/dom/Comment;
.end method

.method public abstract createDocumentFragment()Lorg/w3c/dom/DocumentFragment;
.end method

.method public abstract createElement(Ljava/lang/String;)Lorg/w3c/dom/Element;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createElementNS(Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/Element;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createEntityReference(Ljava/lang/String;)Lorg/w3c/dom/EntityReference;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createProcessingInstruction(Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/ProcessingInstruction;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract createTextNode(Ljava/lang/String;)Lorg/w3c/dom/Text;
.end method

.method public abstract getDoctype()Lorg/w3c/dom/DocumentType;
.end method

.method public abstract getDocumentElement()Lorg/w3c/dom/Element;
.end method

.method public abstract getDocumentURI()Ljava/lang/String;
.end method

.method public abstract getDomConfig()Lorg/w3c/dom/DOMConfiguration;
.end method

.method public abstract getElementById(Ljava/lang/String;)Lorg/w3c/dom/Element;
.end method

.method public abstract getElementsByTagName(Ljava/lang/String;)Lorg/w3c/dom/NodeList;
.end method

.method public abstract getElementsByTagNameNS(Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/NodeList;
.end method

.method public abstract getImplementation()Lorg/w3c/dom/DOMImplementation;
.end method

.method public abstract getInputEncoding()Ljava/lang/String;
.end method

.method public abstract getStrictErrorChecking()Z
.end method

.method public abstract getXmlEncoding()Ljava/lang/String;
.end method

.method public abstract getXmlStandalone()Z
.end method

.method public abstract getXmlVersion()Ljava/lang/String;
.end method

.method public abstract importNode(Lorg/w3c/dom/Node;Z)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract normalizeDocument()V
.end method

.method public abstract renameNode(Lorg/w3c/dom/Node;Ljava/lang/String;Ljava/lang/String;)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract setDocumentURI(Ljava/lang/String;)V
.end method

.method public abstract setStrictErrorChecking(Z)V
.end method

.method public abstract setXmlStandalone(Z)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract setXmlVersion(Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method
