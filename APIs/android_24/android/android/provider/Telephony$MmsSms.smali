.class public final Landroid/provider/Telephony$MmsSms;
.super Ljava/lang/Object;
.source "Telephony.java"

# interfaces
.implements Landroid/provider/BaseColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/Telephony;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "MmsSms"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/provider/Telephony$MmsSms$PendingMessages;
    }
.end annotation


# static fields
.field public static final CONTENT_CONVERSATIONS_URI:Landroid/net/Uri;

.field public static final CONTENT_DRAFT_URI:Landroid/net/Uri;

.field public static final CONTENT_FILTER_BYPHONE_URI:Landroid/net/Uri;

.field public static final CONTENT_LOCKED_URI:Landroid/net/Uri;

.field public static final CONTENT_UNDELIVERED_URI:Landroid/net/Uri;

.field public static final CONTENT_URI:Landroid/net/Uri;

.field public static final ERR_TYPE_GENERIC:I = 0x1

.field public static final ERR_TYPE_GENERIC_PERMANENT:I = 0xa

.field public static final ERR_TYPE_MMS_PROTO_PERMANENT:I = 0xc

.field public static final ERR_TYPE_MMS_PROTO_TRANSIENT:I = 0x3

.field public static final ERR_TYPE_SMS_PROTO_PERMANENT:I = 0xb

.field public static final ERR_TYPE_SMS_PROTO_TRANSIENT:I = 0x2

.field public static final ERR_TYPE_TRANSPORT_FAILURE:I = 0x4

.field public static final MMS_PROTO:I = 0x1

.field public static final NO_ERROR:I = 0x0

.field public static final SEARCH_URI:Landroid/net/Uri;

.field public static final SMS_PROTO:I = 0x0

.field public static final TYPE_DISCRIMINATOR_COLUMN:Ljava/lang/String; = "transport_type"


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 303
    sput-object v0, Landroid/provider/Telephony$MmsSms;->CONTENT_CONVERSATIONS_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/Telephony$MmsSms;->CONTENT_DRAFT_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/Telephony$MmsSms;->CONTENT_FILTER_BYPHONE_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/Telephony$MmsSms;->CONTENT_LOCKED_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/Telephony$MmsSms;->CONTENT_UNDELIVERED_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/Telephony$MmsSms;->CONTENT_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/Telephony$MmsSms;->SEARCH_URI:Landroid/net/Uri;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 284
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
