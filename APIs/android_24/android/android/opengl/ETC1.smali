.class public Landroid/opengl/ETC1;
.super Ljava/lang/Object;
.source "ETC1.java"


# static fields
.field public static final DECODED_BLOCK_SIZE:I = 0x30

.field public static final ENCODED_BLOCK_SIZE:I = 0x8

.field public static final ETC1_RGB8_OES:I = 0x8d64

.field public static final ETC_PKM_HEADER_SIZE:I = 0x10


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

.method public static native decodeBlock(Ljava/nio/Buffer;Ljava/nio/Buffer;)V
.end method

.method public static native decodeImage(Ljava/nio/Buffer;Ljava/nio/Buffer;IIII)V
.end method

.method public static native encodeBlock(Ljava/nio/Buffer;ILjava/nio/Buffer;)V
.end method

.method public static native encodeImage(Ljava/nio/Buffer;IIIILjava/nio/Buffer;)V
.end method

.method public static native formatHeader(Ljava/nio/Buffer;II)V
.end method

.method public static native getEncodedDataSize(II)I
.end method

.method public static native getHeight(Ljava/nio/Buffer;)I
.end method

.method public static native getWidth(Ljava/nio/Buffer;)I
.end method

.method public static native isValid(Ljava/nio/Buffer;)Z
.end method
