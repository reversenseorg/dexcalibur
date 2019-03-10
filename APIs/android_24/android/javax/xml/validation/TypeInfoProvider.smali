.class public abstract Ljavax/xml/validation/TypeInfoProvider;
.super Ljava/lang/Object;
.source "TypeInfoProvider.java"


# direct methods
.method protected constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract getAttributeTypeInfo(I)Lorg/w3c/dom/TypeInfo;
.end method

.method public abstract getElementTypeInfo()Lorg/w3c/dom/TypeInfo;
.end method

.method public abstract isIdAttribute(I)Z
.end method

.method public abstract isSpecified(I)Z
.end method
