.class public final Landroid/provider/ContactsContract$CommonDataKinds$GroupMembership;
.super Ljava/lang/Object;
.source "ContactsContract.java"

# interfaces
.implements Landroid/provider/ContactsContract$DataColumnsWithJoins;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract$CommonDataKinds;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "GroupMembership"
.end annotation


# static fields
.field public static final CONTENT_ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/group_membership"

.field public static final EXTRA_ADDRESS_BOOK_INDEX:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX"

.field public static final EXTRA_ADDRESS_BOOK_INDEX_COUNTS:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX_COUNTS"

.field public static final EXTRA_ADDRESS_BOOK_INDEX_TITLES:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX_TITLES"

.field public static final GROUP_ROW_ID:Ljava/lang/String; = "data1"

.field public static final GROUP_SOURCE_ID:Ljava/lang/String; = "group_sourceid"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 763
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
