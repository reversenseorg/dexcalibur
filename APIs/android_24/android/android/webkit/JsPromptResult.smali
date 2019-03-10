.class public Landroid/webkit/JsPromptResult;
.super Landroid/webkit/JsResult;
.source "JsPromptResult.java"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/webkit/JsResult;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public confirm(Ljava/lang/String;)V
    .locals 2
    .param p1, "result"    # Ljava/lang/String;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
