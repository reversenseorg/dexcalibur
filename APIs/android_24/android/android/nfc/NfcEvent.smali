.class public final Landroid/nfc/NfcEvent;
.super Ljava/lang/Object;
.source "NfcEvent.java"


# instance fields
.field public final nfcAdapter:Landroid/nfc/NfcAdapter;


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
