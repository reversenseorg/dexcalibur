.class public Landroid/net/rtp/AudioCodec;
.super Ljava/lang/Object;
.source "AudioCodec.java"


# static fields
.field public static final AMR:Landroid/net/rtp/AudioCodec;

.field public static final GSM:Landroid/net/rtp/AudioCodec;

.field public static final GSM_EFR:Landroid/net/rtp/AudioCodec;

.field public static final PCMA:Landroid/net/rtp/AudioCodec;

.field public static final PCMU:Landroid/net/rtp/AudioCodec;


# instance fields
.field public final fmtp:Ljava/lang/String;

.field public final rtpmap:Ljava/lang/String;

.field public final type:I


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 15
    sput-object v0, Landroid/net/rtp/AudioCodec;->AMR:Landroid/net/rtp/AudioCodec;

    sput-object v0, Landroid/net/rtp/AudioCodec;->GSM:Landroid/net/rtp/AudioCodec;

    sput-object v0, Landroid/net/rtp/AudioCodec;->GSM_EFR:Landroid/net/rtp/AudioCodec;

    sput-object v0, Landroid/net/rtp/AudioCodec;->PCMA:Landroid/net/rtp/AudioCodec;

    sput-object v0, Landroid/net/rtp/AudioCodec;->PCMU:Landroid/net/rtp/AudioCodec;

    return-void
.end method

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

.method public static getCodec(ILjava/lang/String;Ljava/lang/String;)Landroid/net/rtp/AudioCodec;
    .locals 2
    .param p0, "type"    # I
    .param p1, "rtpmap"    # Ljava/lang/String;
    .param p2, "fmtp"    # Ljava/lang/String;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static getCodecs()[Landroid/net/rtp/AudioCodec;
    .locals 2

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
