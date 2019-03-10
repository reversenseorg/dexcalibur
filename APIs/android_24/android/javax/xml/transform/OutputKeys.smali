.class public Ljavax/xml/transform/OutputKeys;
.super Ljava/lang/Object;
.source "OutputKeys.java"


# static fields
.field public static final CDATA_SECTION_ELEMENTS:Ljava/lang/String; = "cdata-section-elements"

.field public static final DOCTYPE_PUBLIC:Ljava/lang/String; = "doctype-public"

.field public static final DOCTYPE_SYSTEM:Ljava/lang/String; = "doctype-system"

.field public static final ENCODING:Ljava/lang/String; = "encoding"

.field public static final INDENT:Ljava/lang/String; = "indent"

.field public static final MEDIA_TYPE:Ljava/lang/String; = "media-type"

.field public static final METHOD:Ljava/lang/String; = "method"

.field public static final OMIT_XML_DECLARATION:Ljava/lang/String; = "omit-xml-declaration"

.field public static final STANDALONE:Ljava/lang/String; = "standalone"

.field public static final VERSION:Ljava/lang/String; = "version"


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
