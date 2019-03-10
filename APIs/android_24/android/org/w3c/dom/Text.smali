.class public interface abstract Lorg/w3c/dom/Text;
.super Ljava/lang/Object;
.source "Text.java"

# interfaces
.implements Lorg/w3c/dom/CharacterData;


# virtual methods
.method public abstract getWholeText()Ljava/lang/String;
.end method

.method public abstract isElementContentWhitespace()Z
.end method

.method public abstract replaceWholeText(Ljava/lang/String;)Lorg/w3c/dom/Text;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method

.method public abstract splitText(I)Lorg/w3c/dom/Text;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;
        }
    .end annotation
.end method
