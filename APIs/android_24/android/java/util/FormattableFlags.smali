.class public Ljava/util/FormattableFlags;
.super Ljava/lang/Object;
.source "FormattableFlags.java"


# static fields
.field public static final ALTERNATE:I = 0x4

.field public static final LEFT_JUSTIFY:I = 0x1

.field public static final UPPERCASE:I = 0x2


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
