.class public final Landroid/provider/ContactsContract$DataUsageFeedback;
.super Ljava/lang/Object;
.source "ContactsContract.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "DataUsageFeedback"
.end annotation


# static fields
.field public static final DELETE_USAGE_URI:Landroid/net/Uri;

.field public static final FEEDBACK_URI:Landroid/net/Uri;

.field public static final USAGE_TYPE:Ljava/lang/String; = "type"

.field public static final USAGE_TYPE_CALL:Ljava/lang/String; = "call"

.field public static final USAGE_TYPE_LONG_TEXT:Ljava/lang/String; = "long_text"

.field public static final USAGE_TYPE_SHORT_TEXT:Ljava/lang/String; = "short_text"


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 911
    sput-object v0, Landroid/provider/ContactsContract$DataUsageFeedback;->DELETE_USAGE_URI:Landroid/net/Uri;

    sput-object v0, Landroid/provider/ContactsContract$DataUsageFeedback;->FEEDBACK_URI:Landroid/net/Uri;

    return-void
.end method

.method public constructor <init>()V
    .locals 2

    .prologue
    .line 904
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
