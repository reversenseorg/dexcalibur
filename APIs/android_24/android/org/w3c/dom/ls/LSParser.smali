.class public interface abstract Lorg/w3c/dom/ls/LSParser;
.super Ljava/lang/Object;
.source "LSParser.java"


# static fields
.field public static final ACTION_APPEND_AS_CHILDREN:S = 0x1s

.field public static final ACTION_INSERT_AFTER:S = 0x4s

.field public static final ACTION_INSERT_BEFORE:S = 0x3s

.field public static final ACTION_REPLACE:S = 0x5s

.field public static final ACTION_REPLACE_CHILDREN:S = 0x2s


# virtual methods
.method public abstract abort()V
.end method

.method public abstract getAsync()Z
.end method

.method public abstract getBusy()Z
.end method

.method public abstract getDomConfig()Lorg/w3c/dom/DOMConfiguration;
.end method

.method public abstract getFilter()Lorg/w3c/dom/ls/LSParserFilter;
.end method

.method public abstract parse(Lorg/w3c/dom/ls/LSInput;)Lorg/w3c/dom/Document;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;,
            Lorg/w3c/dom/ls/LSException;
        }
    .end annotation
.end method

.method public abstract parseURI(Ljava/lang/String;)Lorg/w3c/dom/Document;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;,
            Lorg/w3c/dom/ls/LSException;
        }
    .end annotation
.end method

.method public abstract parseWithContext(Lorg/w3c/dom/ls/LSInput;Lorg/w3c/dom/Node;S)Lorg/w3c/dom/Node;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Lorg/w3c/dom/DOMException;,
            Lorg/w3c/dom/ls/LSException;
        }
    .end annotation
.end method

.method public abstract setFilter(Lorg/w3c/dom/ls/LSParserFilter;)V
.end method
