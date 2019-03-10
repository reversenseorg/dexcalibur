.class public final Landroid/provider/ContactsContract$Directory;
.super Ljava/lang/Object;
.source "ContactsContract.java"

# interfaces
.implements Landroid/provider/BaseColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Directory"
.end annotation


# static fields
.field public static final ACCOUNT_NAME:Ljava/lang/String; = "accountName"

.field public static final ACCOUNT_TYPE:Ljava/lang/String; = "accountType"

.field public static final CONTENT_ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/contact_directory"

.field public static final CONTENT_TYPE:Ljava/lang/String; = "vnd.android.cursor.dir/contact_directories"

.field public static final CONTENT_URI:Landroid/net/Uri;

.field public static final DEFAULT:J = 0x0L

.field public static final DIRECTORY_AUTHORITY:Ljava/lang/String; = "authority"

.field public static final DISPLAY_NAME:Ljava/lang/String; = "displayName"

.field public static final EXPORT_SUPPORT:Ljava/lang/String; = "exportSupport"

.field public static final EXPORT_SUPPORT_ANY_ACCOUNT:I = 0x2

.field public static final EXPORT_SUPPORT_NONE:I = 0x0

.field public static final EXPORT_SUPPORT_SAME_ACCOUNT_ONLY:I = 0x1

.field public static final LOCAL_INVISIBLE:J = 0x1L

.field public static final PACKAGE_NAME:Ljava/lang/String; = "packageName"

.field public static final PHOTO_SUPPORT:Ljava/lang/String; = "photoSupport"

.field public static final PHOTO_SUPPORT_FULL:I = 0x3

.field public static final PHOTO_SUPPORT_FULL_SIZE_ONLY:I = 0x2

.field public static final PHOTO_SUPPORT_NONE:I = 0x0

.field public static final PHOTO_SUPPORT_THUMBNAIL_ONLY:I = 0x1

.field public static final SHORTCUT_SUPPORT:Ljava/lang/String; = "shortcutSupport"

.field public static final SHORTCUT_SUPPORT_DATA_ITEMS_ONLY:I = 0x1

.field public static final SHORTCUT_SUPPORT_FULL:I = 0x2

.field public static final SHORTCUT_SUPPORT_NONE:I = 0x0

.field public static final TYPE_RESOURCE_ID:Ljava/lang/String; = "typeResourceId"


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    .line 34
    const/4 v0, 0x0

    sput-object v0, Landroid/provider/ContactsContract$Directory;->CONTENT_URI:Landroid/net/Uri;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 8
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static notifyDirectoryChange(Landroid/content/ContentResolver;)V
    .locals 2
    .param p0, "resolver"    # Landroid/content/ContentResolver;

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
