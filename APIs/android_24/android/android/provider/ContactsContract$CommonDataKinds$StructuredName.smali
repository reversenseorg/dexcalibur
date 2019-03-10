.class public final Landroid/provider/ContactsContract$CommonDataKinds$StructuredName;
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
    name = "StructuredName"
.end annotation


# static fields
.field public static final CONTENT_ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/name"

.field public static final DISPLAY_NAME:Ljava/lang/String; = "data1"

.field public static final EXTRA_ADDRESS_BOOK_INDEX:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX"

.field public static final EXTRA_ADDRESS_BOOK_INDEX_COUNTS:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX_COUNTS"

.field public static final EXTRA_ADDRESS_BOOK_INDEX_TITLES:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX_TITLES"

.field public static final FAMILY_NAME:Ljava/lang/String; = "data3"

.field public static final FULL_NAME_STYLE:Ljava/lang/String; = "data10"

.field public static final GIVEN_NAME:Ljava/lang/String; = "data2"

.field public static final MIDDLE_NAME:Ljava/lang/String; = "data5"

.field public static final PHONETIC_FAMILY_NAME:Ljava/lang/String; = "data9"

.field public static final PHONETIC_GIVEN_NAME:Ljava/lang/String; = "data7"

.field public static final PHONETIC_MIDDLE_NAME:Ljava/lang/String; = "data8"

.field public static final PREFIX:Ljava/lang/String; = "data4"

.field public static final SUFFIX:Ljava/lang/String; = "data6"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 531
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
