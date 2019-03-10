.class public Landroid/print/pdf/PrintedPdfDocument;
.super Landroid/graphics/pdf/PdfDocument;
.source "PrintedPdfDocument.java"


# direct methods
.method public constructor <init>(Landroid/content/Context;Landroid/print/PrintAttributes;)V
    .locals 2
    .param p1, "context"    # Landroid/content/Context;
    .param p2, "attributes"    # Landroid/print/PrintAttributes;

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/graphics/pdf/PdfDocument;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getPageContentRect()Landroid/graphics/Rect;
    .locals 2

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getPageHeight()I
    .locals 2

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getPageWidth()I
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public startPage(I)Landroid/graphics/pdf/PdfDocument$Page;
    .locals 2
    .param p1, "pageNumber"    # I

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
