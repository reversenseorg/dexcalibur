.class public interface abstract Lorg/w3c/dom/ls/LSParserFilter;
.super Ljava/lang/Object;
.source "LSParserFilter.java"


# static fields
.field public static final FILTER_ACCEPT:S = 0x1s

.field public static final FILTER_INTERRUPT:S = 0x4s

.field public static final FILTER_REJECT:S = 0x2s

.field public static final FILTER_SKIP:S = 0x3s


# virtual methods
.method public abstract acceptNode(Lorg/w3c/dom/Node;)S
.end method

.method public abstract getWhatToShow()I
.end method

.method public abstract startElement(Lorg/w3c/dom/Element;)S
.end method
