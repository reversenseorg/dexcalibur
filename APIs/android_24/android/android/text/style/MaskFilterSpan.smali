.class public Landroid/text/style/MaskFilterSpan;
.super Landroid/text/style/CharacterStyle;
.source "MaskFilterSpan.java"

# interfaces
.implements Landroid/text/style/UpdateAppearance;


# direct methods
.method public constructor <init>(Landroid/graphics/MaskFilter;)V
    .locals 2
    .param p1, "filter"    # Landroid/graphics/MaskFilter;

    .prologue
    .line 6
    invoke-direct {p0}, Landroid/text/style/CharacterStyle;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getMaskFilter()Landroid/graphics/MaskFilter;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public updateDrawState(Landroid/text/TextPaint;)V
    .locals 2
    .param p1, "ds"    # Landroid/text/TextPaint;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
