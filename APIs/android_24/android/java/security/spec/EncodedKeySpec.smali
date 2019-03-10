.class public abstract Ljava/security/spec/EncodedKeySpec;
.super Ljava/lang/Object;
.source "EncodedKeySpec.java"

# interfaces
.implements Ljava/security/spec/KeySpec;


# direct methods
.method public constructor <init>([B)V
    .locals 2
    .param p1, "encodedKey"    # [B

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getEncoded()[B
    .locals 2

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract getFormat()Ljava/lang/String;
.end method
