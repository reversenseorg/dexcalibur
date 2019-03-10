.class public interface abstract Lorg/w3c/dom/Attr;
.super Ljava/lang/Object;
.source "Attr.java"

# interfaces
.implements Lorg/w3c/dom/Node;


# virtual methods
.method public abstract getName()Ljava/lang/String;
.end method

.method public abstract getOwnerElement()Lorg/w3c/dom/Element;
.end method

.method public abstract getSchemaTypeInfo()Lorg/w3c/dom/TypeInfo;
.end method

.method public abstract getSpecified()Z
.end method

.method public abstract getValue()Ljava/lang/String;
.end method

.method public abstract isId()Z
.end method

.method public abstract setValue(Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method
