.class public final Landroid/media/MediaFormat;
.super Ljava/lang/Object;
.source "MediaFormat.java"


# static fields
.field public static final KEY_AAC_DRC_ATTENUATION_FACTOR:Ljava/lang/String; = "aac-drc-cut-level"

.field public static final KEY_AAC_DRC_BOOST_FACTOR:Ljava/lang/String; = "aac-drc-boost-level"

.field public static final KEY_AAC_DRC_HEAVY_COMPRESSION:Ljava/lang/String; = "aac-drc-heavy-compression"

.field public static final KEY_AAC_DRC_TARGET_REFERENCE_LEVEL:Ljava/lang/String; = "aac-target-ref-level"

.field public static final KEY_AAC_ENCODED_TARGET_LEVEL:Ljava/lang/String; = "aac-encoded-target-level"

.field public static final KEY_AAC_MAX_OUTPUT_CHANNEL_COUNT:Ljava/lang/String; = "aac-max-output-channel_count"

.field public static final KEY_AAC_PROFILE:Ljava/lang/String; = "aac-profile"

.field public static final KEY_AAC_SBR_MODE:Ljava/lang/String; = "aac-sbr-mode"

.field public static final KEY_AUDIO_SESSION_ID:Ljava/lang/String; = "audio-session-id"

.field public static final KEY_BITRATE_MODE:Ljava/lang/String; = "bitrate-mode"

.field public static final KEY_BIT_RATE:Ljava/lang/String; = "bitrate"

.field public static final KEY_CAPTURE_RATE:Ljava/lang/String; = "capture-rate"

.field public static final KEY_CHANNEL_COUNT:Ljava/lang/String; = "channel-count"

.field public static final KEY_CHANNEL_MASK:Ljava/lang/String; = "channel-mask"

.field public static final KEY_COLOR_FORMAT:Ljava/lang/String; = "color-format"

.field public static final KEY_COMPLEXITY:Ljava/lang/String; = "complexity"

.field public static final KEY_DURATION:Ljava/lang/String; = "durationUs"

.field public static final KEY_FLAC_COMPRESSION_LEVEL:Ljava/lang/String; = "flac-compression-level"

.field public static final KEY_FRAME_RATE:Ljava/lang/String; = "frame-rate"

.field public static final KEY_HEIGHT:Ljava/lang/String; = "height"

.field public static final KEY_IS_ADTS:Ljava/lang/String; = "is-adts"

.field public static final KEY_IS_AUTOSELECT:Ljava/lang/String; = "is-autoselect"

.field public static final KEY_IS_DEFAULT:Ljava/lang/String; = "is-default"

.field public static final KEY_IS_FORCED_SUBTITLE:Ljava/lang/String; = "is-forced-subtitle"

.field public static final KEY_I_FRAME_INTERVAL:Ljava/lang/String; = "i-frame-interval"

.field public static final KEY_LANGUAGE:Ljava/lang/String; = "language"

.field public static final KEY_MAX_HEIGHT:Ljava/lang/String; = "max-height"

.field public static final KEY_MAX_INPUT_SIZE:Ljava/lang/String; = "max-input-size"

.field public static final KEY_MAX_WIDTH:Ljava/lang/String; = "max-width"

.field public static final KEY_MIME:Ljava/lang/String; = "mime"

.field public static final KEY_PROFILE:Ljava/lang/String; = "profile"

.field public static final KEY_PUSH_BLANK_BUFFERS_ON_STOP:Ljava/lang/String; = "push-blank-buffers-on-shutdown"

.field public static final KEY_REPEAT_PREVIOUS_FRAME_AFTER:Ljava/lang/String; = "repeat-previous-frame-after"

.field public static final KEY_SAMPLE_RATE:Ljava/lang/String; = "sample-rate"

.field public static final KEY_TEMPORAL_LAYERING:Ljava/lang/String; = "ts-schema"

.field public static final KEY_WIDTH:Ljava/lang/String; = "width"

.field public static final MIMETYPE_AUDIO_AAC:Ljava/lang/String; = "audio/mp4a-latm"

.field public static final MIMETYPE_AUDIO_AC3:Ljava/lang/String; = "audio/ac3"

.field public static final MIMETYPE_AUDIO_AMR_NB:Ljava/lang/String; = "audio/3gpp"

.field public static final MIMETYPE_AUDIO_AMR_WB:Ljava/lang/String; = "audio/amr-wb"

.field public static final MIMETYPE_AUDIO_FLAC:Ljava/lang/String; = "audio/flac"

.field public static final MIMETYPE_AUDIO_G711_ALAW:Ljava/lang/String; = "audio/g711-alaw"

.field public static final MIMETYPE_AUDIO_G711_MLAW:Ljava/lang/String; = "audio/g711-mlaw"

.field public static final MIMETYPE_AUDIO_MPEG:Ljava/lang/String; = "audio/mpeg"

.field public static final MIMETYPE_AUDIO_MSGSM:Ljava/lang/String; = "audio/gsm"

.field public static final MIMETYPE_AUDIO_OPUS:Ljava/lang/String; = "audio/opus"

.field public static final MIMETYPE_AUDIO_QCELP:Ljava/lang/String; = "audio/qcelp"

.field public static final MIMETYPE_AUDIO_RAW:Ljava/lang/String; = "audio/raw"

.field public static final MIMETYPE_AUDIO_VORBIS:Ljava/lang/String; = "audio/vorbis"

.field public static final MIMETYPE_TEXT_CEA_608:Ljava/lang/String; = "text/cea-608"

.field public static final MIMETYPE_TEXT_VTT:Ljava/lang/String; = "text/vtt"

.field public static final MIMETYPE_VIDEO_AVC:Ljava/lang/String; = "video/avc"

.field public static final MIMETYPE_VIDEO_H263:Ljava/lang/String; = "video/3gpp"

.field public static final MIMETYPE_VIDEO_HEVC:Ljava/lang/String; = "video/hevc"

.field public static final MIMETYPE_VIDEO_MPEG2:Ljava/lang/String; = "video/mpeg2"

.field public static final MIMETYPE_VIDEO_MPEG4:Ljava/lang/String; = "video/mp4v-es"

.field public static final MIMETYPE_VIDEO_RAW:Ljava/lang/String; = "video/raw"

.field public static final MIMETYPE_VIDEO_VP8:Ljava/lang/String; = "video/x-vnd.on2.vp8"

.field public static final MIMETYPE_VIDEO_VP9:Ljava/lang/String; = "video/x-vnd.on2.vp9"


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

.method public static final createAudioFormat(Ljava/lang/String;II)Landroid/media/MediaFormat;
    .locals 2
    .param p0, "mime"    # Ljava/lang/String;
    .param p1, "sampleRate"    # I
    .param p2, "channelCount"    # I

    .prologue
    .line 18
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final createSubtitleFormat(Ljava/lang/String;Ljava/lang/String;)Landroid/media/MediaFormat;
    .locals 2
    .param p0, "mime"    # Ljava/lang/String;
    .param p1, "language"    # Ljava/lang/String;

    .prologue
    .line 19
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final createVideoFormat(Ljava/lang/String;II)Landroid/media/MediaFormat;
    .locals 2
    .param p0, "mime"    # Ljava/lang/String;
    .param p1, "width"    # I
    .param p2, "height"    # I

    .prologue
    .line 20
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public final containsKey(Ljava/lang/String;)Z
    .locals 2
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final getByteBuffer(Ljava/lang/String;)Ljava/nio/ByteBuffer;
    .locals 2
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 10
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getFeatureEnabled(Ljava/lang/String;)Z
    .locals 2
    .param p1, "feature"    # Ljava/lang/String;

    .prologue
    .line 11
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final getFloat(Ljava/lang/String;)F
    .locals 2
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final getInteger(Ljava/lang/String;)I
    .locals 2
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final getLong(Ljava/lang/String;)J
    .locals 2
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final getString(Ljava/lang/String;)Ljava/lang/String;
    .locals 2
    .param p1, "name"    # Ljava/lang/String;

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final setByteBuffer(Ljava/lang/String;Ljava/nio/ByteBuffer;)V
    .locals 2
    .param p1, "name"    # Ljava/lang/String;
    .param p2, "bytes"    # Ljava/nio/ByteBuffer;

    .prologue
    .line 16
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setFeatureEnabled(Ljava/lang/String;Z)V
    .locals 2
    .param p1, "feature"    # Ljava/lang/String;
    .param p2, "enabled"    # Z

    .prologue
    .line 17
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final setFloat(Ljava/lang/String;F)V
    .locals 2
    .param p1, "name"    # Ljava/lang/String;
    .param p2, "value"    # F

    .prologue
    .line 14
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final setInteger(Ljava/lang/String;I)V
    .locals 2
    .param p1, "name"    # Ljava/lang/String;
    .param p2, "value"    # I

    .prologue
    .line 12
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final setLong(Ljava/lang/String;J)V
    .locals 2
    .param p1, "name"    # Ljava/lang/String;
    .param p2, "value"    # J

    .prologue
    .line 13
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public final setString(Ljava/lang/String;Ljava/lang/String;)V
    .locals 2
    .param p1, "name"    # Ljava/lang/String;
    .param p2, "value"    # Ljava/lang/String;

    .prologue
    .line 15
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toString()Ljava/lang/String;
    .locals 2

    .prologue
    .line 21
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
