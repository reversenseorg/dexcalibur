.class public final Landroid/provider/VoicemailContract$Status;
.super Ljava/lang/Object;
.source "VoicemailContract.java"

# interfaces
.implements Landroid/provider/BaseColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/VoicemailContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Status"
.end annotation


# static fields
.field public static final CONFIGURATION_STATE:Ljava/lang/String; = "configuration_state"

.field public static final CONFIGURATION_STATE_CAN_BE_CONFIGURED:I = 0x2

.field public static final CONFIGURATION_STATE_NOT_CONFIGURED:I = 0x1

.field public static final CONFIGURATION_STATE_OK:I = 0x0

.field public static final CONTENT_URI:Landroid/net/Uri;

.field public static final DATA_CHANNEL_STATE:Ljava/lang/String; = "data_channel_state"

.field public static final DATA_CHANNEL_STATE_NO_CONNECTION:I = 0x1

.field public static final DATA_CHANNEL_STATE_OK:I = 0x0

.field public static final DIR_TYPE:Ljava/lang/String; = "vnd.android.cursor.dir/voicemail.source.status"

.field public static final ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/voicemail.source.status"

.field public static final NOTIFICATION_CHANNEL_STATE:Ljava/lang/String; = "notification_channel_state"

.field public static final NOTIFICATION_CHANNEL_STATE_MESSAGE_WAITING:I = 0x2

.field public static final NOTIFICATION_CHANNEL_STATE_NO_CONNECTION:I = 0x1

.field public static final NOTIFICATION_CHANNEL_STATE_OK:I = 0x0

.field public static final SETTINGS_URI:Ljava/lang/String; = "settings_uri"

.field public static final SOURCE_PACKAGE:Ljava/lang/String; = "source_package"

.field public static final VOICEMAIL_ACCESS_URI:Ljava/lang/String; = "voicemail_access_uri"


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    .line 45
    const/4 v0, 0x0

    sput-object v0, Landroid/provider/VoicemailContract$Status;->CONTENT_URI:Landroid/net/Uri;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 26
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static buildSourceUri(Ljava/lang/String;)Landroid/net/Uri;
    .locals 2
    .param p0, "packageName"    # Ljava/lang/String;

    .prologue
    .line 27
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
