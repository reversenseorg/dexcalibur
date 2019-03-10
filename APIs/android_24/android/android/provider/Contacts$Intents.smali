.class public final Landroid/provider/Contacts$Intents;
.super Ljava/lang/Object;
.source "Contacts.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/Contacts;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Intents"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/provider/Contacts$Intents$Insert;,
        Landroid/provider/Contacts$Intents$UI;
    }
.end annotation

.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final ATTACH_IMAGE:Ljava/lang/String; = "com.android.contacts.action.ATTACH_IMAGE"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final EXTRA_CREATE_DESCRIPTION:Ljava/lang/String; = "com.android.contacts.action.CREATE_DESCRIPTION"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final EXTRA_FORCE_CREATE:Ljava/lang/String; = "com.android.contacts.action.FORCE_CREATE"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SEARCH_SUGGESTION_CLICKED:Ljava/lang/String; = "android.provider.Contacts.SEARCH_SUGGESTION_CLICKED"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SEARCH_SUGGESTION_CREATE_CONTACT_CLICKED:Ljava/lang/String; = "android.provider.Contacts.SEARCH_SUGGESTION_CREATE_CONTACT_CLICKED"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SEARCH_SUGGESTION_DIAL_NUMBER_CLICKED:Ljava/lang/String; = "android.provider.Contacts.SEARCH_SUGGESTION_DIAL_NUMBER_CLICKED"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final SHOW_OR_CREATE_CONTACT:Ljava/lang/String; = "com.android.contacts.action.SHOW_OR_CREATE_CONTACT"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field


# direct methods
.method public constructor <init>()V
    .locals 2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation

    .prologue
    .line 533
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
