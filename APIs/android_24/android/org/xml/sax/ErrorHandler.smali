.class public interface abstract Lorg/xml/sax/ErrorHandler;
.super Ljava/lang/Object;
.source "ErrorHandler.java"


# virtual methods
.method public abstract error(Lorg/xml/sax/SAXParseException;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXException;
        }
    .end annotation
.end method

.method public abstract fatalError(Lorg/xml/sax/SAXParseException;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXException;
        }
    .end annotation
.end method

.method public abstract warning(Lorg/xml/sax/SAXParseException;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXException;
        }
    .end annotation
.end method
