.class public final Landroid/media/tv/TvContract$Programs;
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
    name = "Programs"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/media/tv/TvContract$Programs$Genres;
    }
.end annotation


# static fields
.field public static final COLUMN_AUDIO_LANGUAGE:Ljava/lang/String; = "audio_language"

.field public static final COLUMN_BROADCAST_GENRE:Ljava/lang/String; = "broadcast_genre"

.field public static final COLUMN_CANONICAL_GENRE:Ljava/lang/String; = "canonical_genre"

.field public static final COLUMN_CHANNEL_ID:Ljava/lang/String; = "channel_id"

.field public static final COLUMN_CONTENT_RATING:Ljava/lang/String; = "content_rating"

.field public static final COLUMN_END_TIME_UTC_MILLIS:Ljava/lang/String; = "end_time_utc_millis"

.field public static final COLUMN_EPISODE_NUMBER:Ljava/lang/String; = "episode_number"

.field public static final COLUMN_EPISODE_TITLE:Ljava/lang/String; = "episode_title"

.field public static final COLUMN_INTERNAL_PROVIDER_DATA:Ljava/lang/String; = "internal_provider_data"

.field public static final COLUMN_LONG_DESCRIPTION:Ljava/lang/String; = "long_description"

.field public static final COLUMN_POSTER_ART_URI:Ljava/lang/String; = "poster_art_uri"

.field public static final COLUMN_SEASON_NUMBER:Ljava/lang/String; = "season_number"

.field public static final COLUMN_SHORT_DESCRIPTION:Ljava/lang/String; = "short_description"

.field public static final COLUMN_START_TIME_UTC_MILLIS:Ljava/lang/String; = "start_time_utc_millis"

.field public static final COLUMN_THUMBNAIL_URI:Ljava/lang/String; = "thumbnail_uri"

.field public static final COLUMN_TITLE:Ljava/lang/String; = "title"

.field public static final COLUMN_VERSION_NUMBER:Ljava/lang/String; = "version_number"

.field public static final COLUMN_VIDEO_HEIGHT:Ljava/lang/String; = "video_height"

.field public static final COLUMN_VIDEO_WIDTH:Ljava/lang/String; = "video_width"

.field public static final CONTENT_ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/program"

.field public static final CONTENT_TYPE:Ljava/lang/String; = "vnd.android.cursor.dir/program"

.field public static final CONTENT_URI:Landroid/net/Uri;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    .line 130
    const/4 v0, 0x0

    sput-object v0, Landroid/media/tv/TvContract$Programs;->CONTENT_URI:Landroid/net/Uri;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 107
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
