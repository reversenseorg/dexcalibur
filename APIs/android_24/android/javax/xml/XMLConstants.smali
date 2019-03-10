.class public final Ljavax/xml/XMLConstants;
.super Ljava/lang/Object;
.source "XMLConstants.java"


# static fields
.field public static final DEFAULT_NS_PREFIX:Ljava/lang/String; = ""

.field public static final FEATURE_SECURE_PROCESSING:Ljava/lang/String; = "http://javax.xml.XMLConstants/feature/secure-processing"

.field public static final NULL_NS_URI:Ljava/lang/String; = ""

.field public static final RELAXNG_NS_URI:Ljava/lang/String; = "http://relaxng.org/ns/structure/1.0"

.field public static final W3C_XML_SCHEMA_INSTANCE_NS_URI:Ljava/lang/String; = "http://www.w3.org/2001/XMLSchema-instance"

.field public static final W3C_XML_SCHEMA_NS_URI:Ljava/lang/String; = "http://www.w3.org/2001/XMLSchema"

.field public static final W3C_XPATH_DATATYPE_NS_URI:Ljava/lang/String; = "http://www.w3.org/2003/11/xpath-datatypes"

.field public static final XMLNS_ATTRIBUTE:Ljava/lang/String; = "xmlns"

.field public static final XMLNS_ATTRIBUTE_NS_URI:Ljava/lang/String; = "http://www.w3.org/2000/xmlns/"

.field public static final XML_DTD_NS_URI:Ljava/lang/String; = "http://www.w3.org/TR/REC-xml"

.field public static final XML_NS_PREFIX:Ljava/lang/String; = "xml"

.field public static final XML_NS_URI:Ljava/lang/String; = "http://www.w3.org/XML/1998/namespace"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
