.class public Landroid/text/TextPaint;
.super Landroid/graphics/Paint;
.source "TextPaint.java"


# instance fields
.field public baselineShift:I

.field public bgColor:I

.field public density:F

.field public drawableState:[I

.field public linkColor:I


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/graphics/Paint;-><init>()V

    .line 12
    const/4 v0, 0x0

    iput-object v0, p0, Landroid/text/TextPaint;->drawableState:[I

    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(I)V
    .locals 2
    .param p1, "flags"    # I

    .prologue
    .line 6
    invoke-direct {p0}, Landroid/graphics/Paint;-><init>()V

    .line 12
    const/4 v0, 0x0

    iput-object v0, p0, Landroid/text/TextPaint;->drawableState:[I

    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Landroid/graphics/Paint;)V
    .locals 2
    .param p1, "p"    # Landroid/graphics/Paint;

    .prologue
    .line 7
    invoke-direct {p0}, Landroid/graphics/Paint;-><init>()V

    .line 12
    const/4 v0, 0x0

    iput-object v0, p0, Landroid/text/TextPaint;->drawableState:[I

    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public set(Landroid/text/TextPaint;)V
    .locals 2
    .param p1, "tp"    # Landroid/text/TextPaint;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
