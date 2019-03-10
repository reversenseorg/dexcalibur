.class public Lorg/w3c/dom/DOMException;
.super Ljava/lang/RuntimeException;
.source "DOMException.java"


# static fields
.field public static final DOMSTRING_SIZE_ERR:S = 0x2s

.field public static final HIERARCHY_REQUEST_ERR:S = 0x3s

.field public static final INDEX_SIZE_ERR:S = 0x1s

.field public static final INUSE_ATTRIBUTE_ERR:S = 0xas

.field public static final INVALID_ACCESS_ERR:S = 0xfs

.field public static final INVALID_CHARACTER_ERR:S = 0x5s

.field public static final INVALID_MODIFICATION_ERR:S = 0xds

.field public static final INVALID_STATE_ERR:S = 0xbs

.field public static final NAMESPACE_ERR:S = 0xes

.field public static final NOT_FOUND_ERR:S = 0x8s

.field public static final NOT_SUPPORTED_ERR:S = 0x9s

.field public static final NO_DATA_ALLOWED_ERR:S = 0x6s

.field public static final NO_MODIFICATION_ALLOWED_ERR:S = 0x7s

.field public static final SYNTAX_ERR:S = 0xcs

.field public static final TYPE_MISMATCH_ERR:S = 0x11s

.field public static final VALIDATION_ERR:S = 0x10s

.field public static final WRONG_DOCUMENT_ERR:S = 0x4s


# instance fields
.field public code:S


# direct methods
.method public constructor <init>(SLjava/lang/String;)V
    .locals 2
    .param p1, "code"    # S
    .param p2, "message"    # Ljava/lang/String;

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/RuntimeException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
