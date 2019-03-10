.class public final Landroid/media/tv/TvContract$Channels;
.super Ljava/lang/Object;
.source "TvContract.java"

# interfaces
.implements Landroid/media/tv/TvContract$BaseTvColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/media/tv/TvContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Channels"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/media/tv/TvContract$Channels$Logo;
    }
.end annotation


# static fields
.field public static final COLUMN_DESCRIPTION:Ljava/lang/String; = "description"

.field public static final COLUMN_DISPLAY_NAME:Ljava/lang/String; = "display_name"

.field public static final COLUMN_DISPLAY_NUMBER:Ljava/lang/String; = "display_number"

.field public static final COLUMN_INPUT_ID:Ljava/lang/String; = "input_id"

.field public static final COLUMN_INTERNAL_PROVIDER_DATA:Ljava/lang/String; = "internal_provider_data"

.field public static final COLUMN_NETWORK_AFFILIATION:Ljava/lang/String; = "network_affiliation"

.field public static final COLUMN_ORIGINAL_NETWORK_ID:Ljava/lang/String; = "original_network_id"

.field public static final COLUMN_SEARCHABLE:Ljava/lang/String; = "searchable"

.field public static final COLUMN_SERVICE_ID:Ljava/lang/String; = "service_id"

.field public static final COLUMN_SERVICE_TYPE:Ljava/lang/String; = "service_type"

.field public static final COLUMN_TRANSPORT_STREAM_ID:Ljava/lang/String; = "transport_stream_id"

.field public static final COLUMN_TYPE:Ljava/lang/String; = "type"

.field public static final COLUMN_VERSION_NUMBER:Ljava/lang/String; = "version_number"

.field public static final COLUMN_VIDEO_FORMAT:Ljava/lang/String; = "video_format"

.field public static final CONTENT_ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/channel"

.field public static final CONTENT_TYPE:Ljava/lang/String; = "vnd.android.cursor.dir/channel"

.field public static final CONTENT_URI:Landroid/net/Uri;

.field public static final SERVICE_TYPE_AUDIO:Ljava/lang/String; = "SERVICE_TYPE_AUDIO"

.field public static final SERVICE_TYPE_AUDIO_VIDEO:Ljava/lang/String; = "SERVICE_TYPE_AUDIO_VIDEO"

.field public static final SERVICE_TYPE_OTHER:Ljava/lang/String; = "SERVICE_TYPE_OTHER"

.field public static final TYPE_1SEG:Ljava/lang/String; = "TYPE_1SEG"

.field public static final TYPE_ATSC_C:Ljava/lang/String; = "TYPE_ATSC_C"

.field public static final TYPE_ATSC_M_H:Ljava/lang/String; = "TYPE_ATSC_M_H"

.field public static final TYPE_ATSC_T:Ljava/lang/String; = "TYPE_ATSC_T"

.field public static final TYPE_CMMB:Ljava/lang/String; = "TYPE_CMMB"

.field public static final TYPE_DTMB:Ljava/lang/String; = "TYPE_DTMB"

.field public static final TYPE_DVB_C:Ljava/lang/String; = "TYPE_DVB_C"

.field public static final TYPE_DVB_C2:Ljava/lang/String; = "TYPE_DVB_C2"

.field public static final TYPE_DVB_H:Ljava/lang/String; = "TYPE_DVB_H"

.field public static final TYPE_DVB_S:Ljava/lang/String; = "TYPE_DVB_S"

.field public static final TYPE_DVB_S2:Ljava/lang/String; = "TYPE_DVB_S2"

.field public static final TYPE_DVB_SH:Ljava/lang/String; = "TYPE_DVB_SH"

.field public static final TYPE_DVB_T:Ljava/lang/String; = "TYPE_DVB_T"

.field public static final TYPE_DVB_T2:Ljava/lang/String; = "TYPE_DVB_T2"

.field public static final TYPE_ISDB_C:Ljava/lang/String; = "TYPE_ISDB_C"

.field public static final TYPE_ISDB_S:Ljava/lang/String; = "TYPE_ISDB_S"

.field public static final TYPE_ISDB_T:Ljava/lang/String; = "TYPE_ISDB_T"

.field public static final TYPE_ISDB_TB:Ljava/lang/String; = "TYPE_ISDB_TB"

.field public static final TYPE_NTSC:Ljava/lang/String; = "TYPE_NTSC"

.field public static final TYPE_OTHER:Ljava/lang/String; = "TYPE_OTHER"

.field public static final TYPE_PAL:Ljava/lang/String; = "TYPE_PAL"

.field public static final TYPE_SECAM:Ljava/lang/String; = "TYPE_SECAM"

.field public static final TYPE_S_DMB:Ljava/lang/String; = "TYPE_S_DMB"

.field public static final TYPE_T_DMB:Ljava/lang/String; = "TYPE_T_DMB"

.field public static final VIDEO_FORMAT_1080I:Ljava/lang/String; = "VIDEO_FORMAT_1080I"

.field public static final VIDEO_FORMAT_1080P:Ljava/lang/String; = "VIDEO_FORMAT_1080P"

.field public static final VIDEO_FORMAT_2160P:Ljava/lang/String; = "VIDEO_FORMAT_2160P"

.field public static final VIDEO_FORMAT_240P:Ljava/lang/String; = "VIDEO_FORMAT_240P"

.field public static final VIDEO_FORMAT_360P:Ljava/lang/String; = "VIDEO_FORMAT_360P"

.field public static final VIDEO_FORMAT_4320P:Ljava/lang/String; = "VIDEO_FORMAT_4320P"

.field public static final VIDEO_FORMAT_480I:Ljava/lang/String; = "VIDEO_FORMAT_480I"

.field public static final VIDEO_FORMAT_480P:Ljava/lang/String; = "VIDEO_FORMAT_480P"

.field public static final VIDEO_FORMAT_576I:Ljava/lang/String; = "VIDEO_FORMAT_576I"

.field public static final VIDEO_FORMAT_576P:Ljava/lang/String; = "VIDEO_FORMAT_576P"

.field public static final VIDEO_FORMAT_720P:Ljava/lang/String; = "VIDEO_FORMAT_720P"

.field public static final VIDEO_RESOLUTION_ED:Ljava/lang/String; = "VIDEO_RESOLUTION_ED"

.field public static final VIDEO_RESOLUTION_FHD:Ljava/lang/String; = "VIDEO_RESOLUTION_FHD"

.field public static final VIDEO_RESOLUTION_HD:Ljava/lang/String; = "VIDEO_RESOLUTION_HD"

.field public static final VIDEO_RESOLUTION_SD:Ljava/lang/String; = "VIDEO_RESOLUTION_SD"

.field public static final VIDEO_RESOLUTION_UHD:Ljava/lang/String; = "VIDEO_RESOLUTION_UHD"


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    .line 79
    const/4 v0, 0x0

    sput-object v0, Landroid/media/tv/TvContract$Channels;->CONTENT_URI:Landroid/net/Uri;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 17
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final getVideoResolution(Ljava/lang/String;)Ljava/lang/String;
    .locals 2
    .param p0, "videoFormat"    # Ljava/lang/String;

    .prologue
    .line 18
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
