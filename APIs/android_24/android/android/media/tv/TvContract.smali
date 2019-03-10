.class public final Landroid/media/tv/TvContract;
.super Ljava/lang/Object;
.source "TvContract.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/media/tv/TvContract$Programs;,
        Landroid/media/tv/TvContract$Channels;,
        Landroid/media/tv/TvContract$BaseTvColumns;
    }
.end annotation


# static fields
.field public static final AUTHORITY:Ljava/lang/String; = "android.media.tv"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 132
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildChannelLogoUri(J)Landroid/net/Uri;
    .locals 2
    .param p0, "channelId"    # J

    .prologue
    .line 136
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildChannelLogoUri(Landroid/net/Uri;)Landroid/net/Uri;
    .locals 2
    .param p0, "channelUri"    # Landroid/net/Uri;

    .prologue
    .line 137
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildChannelUri(J)Landroid/net/Uri;
    .locals 2
    .param p0, "channelId"    # J

    .prologue
    .line 134
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildChannelUriForPassthroughInput(Ljava/lang/String;)Landroid/net/Uri;
    .locals 2
    .param p0, "inputId"    # Ljava/lang/String;

    .prologue
    .line 135
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildChannelsUriForInput(Ljava/lang/String;)Landroid/net/Uri;
    .locals 2
    .param p0, "inputId"    # Ljava/lang/String;

    .prologue
    .line 138
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildInputId(Landroid/content/ComponentName;)Ljava/lang/String;
    .locals 2
    .param p0, "name"    # Landroid/content/ComponentName;

    .prologue
    .line 133
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildProgramUri(J)Landroid/net/Uri;
    .locals 2
    .param p0, "programId"    # J

    .prologue
    .line 139
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildProgramsUriForChannel(J)Landroid/net/Uri;
    .locals 2
    .param p0, "channelId"    # J

    .prologue
    .line 140
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildProgramsUriForChannel(JJJ)Landroid/net/Uri;
    .locals 2
    .param p0, "channelId"    # J
    .param p2, "startTime"    # J
    .param p4, "endTime"    # J

    .prologue
    .line 142
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildProgramsUriForChannel(Landroid/net/Uri;)Landroid/net/Uri;
    .locals 2
    .param p0, "channelUri"    # Landroid/net/Uri;

    .prologue
    .line 141
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final buildProgramsUriForChannel(Landroid/net/Uri;JJ)Landroid/net/Uri;
    .locals 2
    .param p0, "channelUri"    # Landroid/net/Uri;
    .param p1, "startTime"    # J
    .param p3, "endTime"    # J

    .prologue
    .line 143
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
