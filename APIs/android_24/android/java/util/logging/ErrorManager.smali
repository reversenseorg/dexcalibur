.class public Ljava/util/logging/ErrorManager;
.super Ljava/lang/Object;
.source "ErrorManager.java"


# static fields
.field public static final CLOSE_FAILURE:I = 0x3

.field public static final FLUSH_FAILURE:I = 0x2

.field public static final FORMAT_FAILURE:I = 0x5

.field public static final GENERIC_FAILURE:I = 0x0

.field public static final OPEN_FAILURE:I = 0x4

.field public static final WRITE_FAILURE:I = 0x1


# direct methods
.method public constructor <init>()V
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
.method public error(Ljava/lang/String;Ljava/lang/Exception;I)V
    .locals 2
    .param p1, "message"    # Ljava/lang/String;
    .param p2, "exception"    # Ljava/lang/Exception;
    .param p3, "errorCode"    # I

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
