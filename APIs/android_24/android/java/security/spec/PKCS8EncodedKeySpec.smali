.class public Ljava/security/spec/PKCS8EncodedKeySpec;
.super Ljava/security/spec/EncodedKeySpec;
.source "PKCS8EncodedKeySpec.java"


# direct methods
.method public constructor <init>([B)V
    .locals 2
    .param p1, "encodedKey"    # [B

    .prologue
    .line 5
    const/4 v0, 0x0

    check-cast v0, [B

    invoke-direct {p0, v0}, Ljava/security/spec/EncodedKeySpec;-><init>([B)V

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

.method public final getFormat()Ljava/lang/String;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
