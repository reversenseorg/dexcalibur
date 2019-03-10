.class public interface abstract Ljava/text/AttributedCharacterIterator;
.super Ljava/lang/Object;
.source "AttributedCharacterIterator.java"

# interfaces
.implements Ljava/text/CharacterIterator;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Ljava/text/AttributedCharacterIterator$Attribute;
    }
.end annotation


# virtual methods
.method public abstract getAllAttributeKeys()Ljava/util/Set;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Set",
            "<",
            "Ljava/text/AttributedCharacterIterator$Attribute;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getAttribute(Ljava/text/AttributedCharacterIterator$Attribute;)Ljava/lang/Object;
.end method

.method public abstract getAttributes()Ljava/util/Map;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Map",
            "<",
            "Ljava/text/AttributedCharacterIterator$Attribute;",
            "Ljava/lang/Object;",
            ">;"
        }
    .end annotation
.end method

.method public abstract getRunLimit()I
.end method

.method public abstract getRunLimit(Ljava/text/AttributedCharacterIterator$Attribute;)I
.end method

.method public abstract getRunLimit(Ljava/util/Set;)I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/Set",
            "<+",
            "Ljava/text/AttributedCharacterIterator$Attribute;",
            ">;)I"
        }
    .end annotation
.end method

.method public abstract getRunStart()I
.end method

.method public abstract getRunStart(Ljava/text/AttributedCharacterIterator$Attribute;)I
.end method

.method public abstract getRunStart(Ljava/util/Set;)I
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/Set",
            "<+",
            "Ljava/text/AttributedCharacterIterator$Attribute;",
            ">;)I"
        }
    .end annotation
.end method
