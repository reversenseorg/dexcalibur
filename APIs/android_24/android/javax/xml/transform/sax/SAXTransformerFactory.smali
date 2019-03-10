.class public abstract Ljavax/xml/transform/sax/SAXTransformerFactory;
.super Ljavax/xml/transform/TransformerFactory;
.source "SAXTransformerFactory.java"


# static fields
.field public static final FEATURE:Ljava/lang/String; = "http://javax.xml.transform.sax.SAXTransformerFactory/feature"

.field public static final FEATURE_XMLFILTER:Ljava/lang/String; = "http://javax.xml.transform.sax.SAXTransformerFactory/feature/xmlfilter"


# direct methods
.method protected constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljavax/xml/transform/TransformerFactory;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract newTemplatesHandler()Ljavax/xml/transform/sax/TemplatesHandler;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerConfigurationException;
        }
    .end annotation
.end method

.method public abstract newTransformerHandler()Ljavax/xml/transform/sax/TransformerHandler;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerConfigurationException;
        }
    .end annotation
.end method

.method public abstract newTransformerHandler(Ljavax/xml/transform/Source;)Ljavax/xml/transform/sax/TransformerHandler;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerConfigurationException;
        }
    .end annotation
.end method

.method public abstract newTransformerHandler(Ljavax/xml/transform/Templates;)Ljavax/xml/transform/sax/TransformerHandler;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerConfigurationException;
        }
    .end annotation
.end method

.method public abstract newXMLFilter(Ljavax/xml/transform/Source;)Lorg/xml/sax/XMLFilter;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerConfigurationException;
        }
    .end annotation
.end method

.method public abstract newXMLFilter(Ljavax/xml/transform/Templates;)Lorg/xml/sax/XMLFilter;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerConfigurationException;
        }
    .end annotation
.end method
