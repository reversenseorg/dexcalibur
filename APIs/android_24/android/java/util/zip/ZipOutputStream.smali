.class public Ljava/util/zip/ZipOutputStream;
.super Ljava/util/zip/DeflaterOutputStream;
.source "ZipOutputStream.java"


# static fields
.field public static final CENATT:I = 0x24

.field public static final CENATX:I = 0x26

.field public static final CENCOM:I = 0x20

.field public static final CENCRC:I = 0x10

.field public static final CENDSK:I = 0x22

.field public static final CENEXT:I = 0x1e

.field public static final CENFLG:I = 0x8

.field public static final CENHDR:I = 0x2e

.field public static final CENHOW:I = 0xa

.field public static final CENLEN:I = 0x18

.field public static final CENNAM:I = 0x1c

.field public static final CENOFF:I = 0x2a

.field public static final CENSIG:J = 0x2014b50L

.field public static final CENSIZ:I = 0x14

.field public static final CENTIM:I = 0xc

.field public static final CENVEM:I = 0x4

.field public static final CENVER:I = 0x6

.field public static final DEFLATED:I = 0x8

.field public static final ENDCOM:I = 0x14

.field public static final ENDHDR:I = 0x16

.field public static final ENDOFF:I = 0x10

.field public static final ENDSIG:J = 0x6054b50L

.field public static final ENDSIZ:I = 0xc

.field public static final ENDSUB:I = 0x8

.field public static final ENDTOT:I = 0xa

.field public static final EXTCRC:I = 0x4

.field public static final EXTHDR:I = 0x10

.field public static final EXTLEN:I = 0xc

.field public static final EXTSIG:J = 0x8074b50L

.field public static final EXTSIZ:I = 0x8

.field public static final LOCCRC:I = 0xe

.field public static final LOCEXT:I = 0x1c

.field public static final LOCFLG:I = 0x6

.field public static final LOCHDR:I = 0x1e

.field public static final LOCHOW:I = 0x8

.field public static final LOCLEN:I = 0x16

.field public static final LOCNAM:I = 0x1a

.field public static final LOCSIG:J = 0x4034b50L

.field public static final LOCSIZ:I = 0x12

.field public static final LOCTIM:I = 0xa

.field public static final LOCVER:I = 0x4

.field public static final STORED:I


# direct methods
.method public constructor <init>(Ljava/io/OutputStream;)V
    .locals 3
    .param p1, "os"    # Ljava/io/OutputStream;

    .prologue
    const/4 v1, 0x0

    const/4 v2, 0x0

    .line 5
    move-object v0, v1

    check-cast v0, Ljava/io/OutputStream;

    check-cast v1, Ljava/util/zip/Deflater;

    invoke-direct {p0, v0, v1, v2, v2}, Ljava/util/zip/DeflaterOutputStream;-><init>(Ljava/io/OutputStream;Ljava/util/zip/Deflater;IZ)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public close()V
    .locals 2
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public closeEntry()V
    .locals 2
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public finish()V
    .locals 2
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public putNextEntry(Ljava/util/zip/ZipEntry;)V
    .locals 2
    .param p1, "ze"    # Ljava/util/zip/ZipEntry;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setComment(Ljava/lang/String;)V
    .locals 2
    .param p1, "comment"    # Ljava/lang/String;

    .prologue
    .line 10
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setLevel(I)V
    .locals 2
    .param p1, "level"    # I

    .prologue
    .line 11
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setMethod(I)V
    .locals 2
    .param p1, "method"    # I

    .prologue
    .line 12
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public write([BII)V
    .locals 2
    .param p1, "buffer"    # [B
    .param p2, "offset"    # I
    .param p3, "byteCount"    # I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .prologue
    .line 13
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
