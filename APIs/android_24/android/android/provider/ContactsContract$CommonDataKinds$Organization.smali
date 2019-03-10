.class public final Landroid/provider/ContactsContract$CommonDataKinds$Organization;
.super Ljava/lang/Object;
.source "ContactsContract.java"

# interfaces
.implements Landroid/provider/ContactsContract$DataColumnsWithJoins;
.implements Landroid/provider/ContactsContract$CommonDataKinds$CommonColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract$CommonDataKinds;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Organization"
.end annotation


# static fields
.field public static final COMPANY:Ljava/lang/String; = "data1"

.field public static final CONTENT_ITEM_TYPE:Ljava/lang/String; = "vnd.android.cursor.item/organization"

.field public static final DEPARTMENT:Ljava/lang/String; = "data5"

.field public static final EXTRA_ADDRESS_BOOK_INDEX:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX"

.field public static final EXTRA_ADDRESS_BOOK_INDEX_COUNTS:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX_COUNTS"

.field public static final EXTRA_ADDRESS_BOOK_INDEX_TITLES:Ljava/lang/String; = "android.provider.extra.ADDRESS_BOOK_INDEX_TITLES"

.field public static final JOB_DESCRIPTION:Ljava/lang/String; = "data6"

.field public static final OFFICE_LOCATION:Ljava/lang/String; = "data9"

.field public static final PHONETIC_NAME:Ljava/lang/String; = "data8"

.field public static final SYMBOL:Ljava/lang/String; = "data7"

.field public static final TITLE:Ljava/lang/String; = "data4"

.field public static final TYPE_OTHER:I = 0x2

.field public static final TYPE_WORK:I = 0x1


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 681
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final getTypeLabel(Landroid/content/res/Resources;ILjava/lang/CharSequence;)Ljava/lang/CharSequence;
    .locals 2
    .param p0, "res"    # Landroid/content/res/Resources;
    .param p1, "type"    # I
    .param p2, "label"    # Ljava/lang/CharSequence;

    .prologue
    .line 683
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static final getTypeLabelResource(I)I
    .locals 2
    .param p0, "type"    # I

    .prologue
    .line 682
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
