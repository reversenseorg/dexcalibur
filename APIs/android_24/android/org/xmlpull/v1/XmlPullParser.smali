.class public interface abstract Lorg/xmlpull/v1/XmlPullParser;
.super Ljava/lang/Object;
.source "XmlPullParser.java"


# static fields
.field public static final CDSECT:I = 0x5

.field public static final COMMENT:I = 0x9

.field public static final DOCDECL:I = 0xa

.field public static final END_DOCUMENT:I = 0x1

.field public static final END_TAG:I = 0x3

.field public static final ENTITY_REF:I = 0x6

.field public static final FEATURE_PROCESS_DOCDECL:Ljava/lang/String; = "http://xmlpull.org/v1/doc/features.html#process-docdecl"

.field public static final FEATURE_PROCESS_NAMESPACES:Ljava/lang/String; = "http://xmlpull.org/v1/doc/features.html#process-namespaces"

.field public static final FEATURE_REPORT_NAMESPACE_ATTRIBUTES:Ljava/lang/String; = "http://xmlpull.org/v1/doc/features.html#report-namespace-prefixes"

.field public static final FEATURE_VALIDATION:Ljava/lang/String; = "http://xmlpull.org/v1/doc/features.html#validation"

.field public static final IGNORABLE_WHITESPACE:I = 0x7

.field public static final NO_NAMESPACE:Ljava/lang/String; = ""

.field public static final PROCESSING_INSTRUCTION:I = 0x8

.field public static final START_DOCUMENT:I = 0x0

.field public static final START_TAG:I = 0x2

.field public static final TEXT:I = 0x4

.field public static final TYPES:[Ljava/lang/String;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    .line 57
    const/4 v0, 0x0

    sput-object v0, Lorg/xmlpull/v1/XmlPullParser;->TYPES:[Ljava/lang/String;

    return-void
.end method


# virtual methods
.method public abstract defineEntityReplacementText(Ljava/lang/String;Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract getAttributeCount()I
.end method

.method public abstract getAttributeName(I)Ljava/lang/String;
.end method

.method public abstract getAttributeNamespace(I)Ljava/lang/String;
.end method

.method public abstract getAttributePrefix(I)Ljava/lang/String;
.end method

.method public abstract getAttributeType(I)Ljava/lang/String;
.end method

.method public abstract getAttributeValue(I)Ljava/lang/String;
.end method

.method public abstract getAttributeValue(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
.end method

.method public abstract getColumnNumber()I
.end method

.method public abstract getDepth()I
.end method

.method public abstract getEventType()I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract getFeature(Ljava/lang/String;)Z
.end method

.method public abstract getInputEncoding()Ljava/lang/String;
.end method

.method public abstract getLineNumber()I
.end method

.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract getNamespace()Ljava/lang/String;
.end method

.method public abstract getNamespace(Ljava/lang/String;)Ljava/lang/String;
.end method

.method public abstract getNamespaceCount(I)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract getNamespacePrefix(I)Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract getNamespaceUri(I)Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract getPositionDescription()Ljava/lang/String;
.end method

.method public abstract getPrefix()Ljava/lang/String;
.end method

.method public abstract getProperty(Ljava/lang/String;)Ljava/lang/Object;
.end method

.method public abstract getText()Ljava/lang/String;
.end method

.method public abstract getTextCharacters([I)[C
.end method

.method public abstract isAttributeDefault(I)Z
.end method

.method public abstract isEmptyElementTag()Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract isWhitespace()Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract next()I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract nextTag()I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract nextText()Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract nextToken()I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract require(ILjava/lang/String;Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;,
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract setFeature(Ljava/lang/String;Z)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract setInput(Ljava/io/InputStream;Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract setInput(Ljava/io/Reader;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method

.method public abstract setProperty(Ljava/lang/String;Ljava/lang/Object;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/xmlpull/v1/XmlPullParserException;
        }
    .end annotation
.end method
