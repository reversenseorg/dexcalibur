.class public Landroid/provider/Contacts;
.super Ljava/lang/Object;
.source "Contacts.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/provider/Contacts$Intents;,
        Landroid/provider/Contacts$Extensions;,
        Landroid/provider/Contacts$ExtensionsColumns;,
        Landroid/provider/Contacts$Photos;,
        Landroid/provider/Contacts$PhotosColumns;,
        Landroid/provider/Contacts$Organizations;,
        Landroid/provider/Contacts$OrganizationColumns;,
        Landroid/provider/Contacts$PresenceColumns;,
        Landroid/provider/Contacts$ContactMethods;,
        Landroid/provider/Contacts$ContactMethodsColumns;,
        Landroid/provider/Contacts$GroupMembership;,
        Landroid/provider/Contacts$Phones;,
        Landroid/provider/Contacts$PhonesColumns;,
        Landroid/provider/Contacts$Groups;,
        Landroid/provider/Contacts$GroupsColumns;,
        Landroid/provider/Contacts$People;,
        Landroid/provider/Contacts$PeopleColumns;,
        Landroid/provider/Contacts$Settings;,
        Landroid/provider/Contacts$SettingsColumns;
    }
.end annotation

.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final AUTHORITY:Ljava/lang/String; = "contacts"
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final CONTENT_URI:Landroid/net/Uri;
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final KIND_EMAIL:I = 0x1
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final KIND_IM:I = 0x3
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final KIND_ORGANIZATION:I = 0x4
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final KIND_PHONE:I = 0x5
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final KIND_POSTAL:I = 0x2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    .line 564
    const/4 v0, 0x0

    sput-object v0, Landroid/provider/Contacts;->CONTENT_URI:Landroid/net/Uri;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 549
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
