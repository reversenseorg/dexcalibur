.class public interface abstract Lorg/w3c/dom/TypeInfo;
.super Ljava/lang/Object;
.source "TypeInfo.java"


# static fields
.field public static final DERIVATION_EXTENSION:I = 0x2

.field public static final DERIVATION_LIST:I = 0x8

.field public static final DERIVATION_RESTRICTION:I = 0x1

.field public static final DERIVATION_UNION:I = 0x4


# virtual methods
.method public abstract getTypeName()Ljava/lang/String;
.end method

.method public abstract getTypeNamespace()Ljava/lang/String;
.end method

.method public abstract isDerivedFrom(Ljava/lang/String;Ljava/lang/String;I)Z
.end method
