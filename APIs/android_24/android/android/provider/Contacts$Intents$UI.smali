.class public final Landroid/provider/Contacts$Intents$UI;
.super Ljava/lang/Object;
.source "Contacts.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/Contacts$Intents;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "UI"
.end annotation

.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final FILTER_CONTACTS_ACTION:Ljava/lang/String; = "com.android.contacts.action.FILTER_CONTACTS"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final FILTER_TEXT_EXTRA_KEY:Ljava/lang/String; = "com.android.contacts.extra.FILTER_TEXT"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final GROUP_NAME_EXTRA_KEY:Ljava/lang/String; = "com.android.contacts.extra.GROUP"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_ALL_CONTACTS_ACTION:Ljava/lang/String; = "com.android.contacts.action.LIST_ALL_CONTACTS"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_CONTACTS_WITH_PHONES_ACTION:Ljava/lang/String; = "com.android.contacts.action.LIST_CONTACTS_WITH_PHONES"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_DEFAULT:Ljava/lang/String; = "com.android.contacts.action.LIST_DEFAULT"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_FREQUENT_ACTION:Ljava/lang/String; = "com.android.contacts.action.LIST_FREQUENT"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_GROUP_ACTION:Ljava/lang/String; = "com.android.contacts.action.LIST_GROUP"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_STARRED_ACTION:Ljava/lang/String; = "com.android.contacts.action.LIST_STARRED"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final LIST_STREQUENT_ACTION:Ljava/lang/String; = "com.android.contacts.action.LIST_STREQUENT"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final TITLE_EXTRA_KEY:Ljava/lang/String; = "com.android.contacts.extra.TITLE_EXTRA"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field


# direct methods
.method public constructor <init>()V
    .locals 2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation

    .prologue
    .line 448
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
