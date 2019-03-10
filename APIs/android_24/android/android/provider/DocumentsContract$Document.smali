.class public final Landroid/provider/DocumentsContract$Document;
.super Ljava/lang/Object;
.source "DocumentsContract.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/DocumentsContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Document"
.end annotation


# static fields
.field public static final COLUMN_DISPLAY_NAME:Ljava/lang/String; = "_display_name"

.field public static final COLUMN_DOCUMENT_ID:Ljava/lang/String; = "document_id"

.field public static final COLUMN_FLAGS:Ljava/lang/String; = "flags"

.field public static final COLUMN_ICON:Ljava/lang/String; = "icon"

.field public static final COLUMN_LAST_MODIFIED:Ljava/lang/String; = "last_modified"

.field public static final COLUMN_MIME_TYPE:Ljava/lang/String; = "mime_type"

.field public static final COLUMN_SIZE:Ljava/lang/String; = "_size"

.field public static final COLUMN_SUMMARY:Ljava/lang/String; = "summary"

.field public static final FLAG_DIR_PREFERS_GRID:I = 0x10

.field public static final FLAG_DIR_PREFERS_LAST_MODIFIED:I = 0x20

.field public static final FLAG_DIR_SUPPORTS_CREATE:I = 0x8

.field public static final FLAG_SUPPORTS_DELETE:I = 0x4

.field public static final FLAG_SUPPORTS_RENAME:I = 0x40

.field public static final FLAG_SUPPORTS_THUMBNAIL:I = 0x1

.field public static final FLAG_SUPPORTS_WRITE:I = 0x2

.field public static final MIME_TYPE_DIR:Ljava/lang/String; = "vnd.android.document/directory"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
