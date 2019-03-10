.class public interface abstract Lorg/xml/sax/XMLReader;
.super Ljava/lang/Object;
.source "XMLReader.java"


# virtual methods
.method public abstract getContentHandler()Lorg/xml/sax/ContentHandler;
.end method

.method public abstract getDTDHandler()Lorg/xml/sax/DTDHandler;
.end method

.method public abstract getEntityResolver()Lorg/xml/sax/EntityResolver;
.end method

.method public abstract getErrorHandler()Lorg/xml/sax/ErrorHandler;
.end method

.method public abstract getFeature(Ljava/lang/String;)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXNotRecognizedException;,
            Lorg/xml/sax/SAXNotSupportedException;
        }
    .end annotation
.end method

.method public abstract getProperty(Ljava/lang/String;)Ljava/lang/Object;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXNotRecognizedException;,
            Lorg/xml/sax/SAXNotSupportedException;
        }
    .end annotation
.end method

.method public abstract parse(Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;,
            Lorg/xml/sax/SAXException;
        }
    .end annotation
.end method

.method public abstract parse(Lorg/xml/sax/InputSource;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;,
            Lorg/xml/sax/SAXException;
        }
    .end annotation
.end method

.method public abstract setContentHandler(Lorg/xml/sax/ContentHandler;)V
.end method

.method public abstract setDTDHandler(Lorg/xml/sax/DTDHandler;)V
.end method

.method public abstract setEntityResolver(Lorg/xml/sax/EntityResolver;)V
.end method

.method public abstract setErrorHandler(Lorg/xml/sax/ErrorHandler;)V
.end method

.method public abstract setFeature(Ljava/lang/String;Z)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXNotRecognizedException;,
            Lorg/xml/sax/SAXNotSupportedException;
        }
    .end annotation
.end method

.method public abstract setProperty(Ljava/lang/String;Ljava/lang/Object;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xml/sax/SAXNotRecognizedException;,
            Lorg/xml/sax/SAXNotSupportedException;
        }
    .end annotation
.end method
