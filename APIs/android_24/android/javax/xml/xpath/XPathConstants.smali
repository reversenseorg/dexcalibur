.class public Ljavax/xml/xpath/XPathConstants;
.super Ljava/lang/Object;
.source "XPathConstants.java"


# static fields
.field public static final BOOLEAN:Ljavax/xml/namespace/QName;

.field public static final DOM_OBJECT_MODEL:Ljava/lang/String; = "http://java.sun.com/jaxp/xpath/dom"

.field public static final NODE:Ljavax/xml/namespace/QName;

.field public static final NODESET:Ljavax/xml/namespace/QName;

.field public static final NUMBER:Ljavax/xml/namespace/QName;

.field public static final STRING:Ljavax/xml/namespace/QName;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 11
    sput-object v0, Ljavax/xml/xpath/XPathConstants;->BOOLEAN:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/xpath/XPathConstants;->NODE:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/xpath/XPathConstants;->NODESET:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/xpath/XPathConstants;->NUMBER:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/xpath/XPathConstants;->STRING:Ljavax/xml/namespace/QName;

    return-void
.end method

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
