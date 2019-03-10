.class public Landroid/util/PrintStreamPrinter;
.super Ljava/lang/Object;
.source "PrintStreamPrinter.java"

# interfaces
.implements Landroid/util/Printer;


# direct methods
.method public constructor <init>(Ljava/io/PrintStream;)V
    .locals 2
    .param p1, "pw"    # Ljava/io/PrintStream;

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public println(Ljava/lang/String;)V
    .locals 2
    .param p1, "x"    # Ljava/lang/String;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
