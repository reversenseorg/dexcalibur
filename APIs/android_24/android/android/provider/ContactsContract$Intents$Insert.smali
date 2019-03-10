.class public final Landroid/provider/ContactsContract$Intents$Insert;
.super Ljava/lang/Object;
.source "ContactsContract.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract$Intents;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Insert"
.end annotation


# static fields
.field public static final ACTION:Ljava/lang/String; = "android.intent.action.INSERT"

.field public static final COMPANY:Ljava/lang/String; = "company"

.field public static final DATA:Ljava/lang/String; = "data"

.field public static final EMAIL:Ljava/lang/String; = "email"

.field public static final EMAIL_ISPRIMARY:Ljava/lang/String; = "email_isprimary"

.field public static final EMAIL_TYPE:Ljava/lang/String; = "email_type"

.field public static final FULL_MODE:Ljava/lang/String; = "full_mode"

.field public static final IM_HANDLE:Ljava/lang/String; = "im_handle"

.field public static final IM_ISPRIMARY:Ljava/lang/String; = "im_isprimary"

.field public static final IM_PROTOCOL:Ljava/lang/String; = "im_protocol"

.field public static final JOB_TITLE:Ljava/lang/String; = "job_title"

.field public static final NAME:Ljava/lang/String; = "name"

.field public static final NOTES:Ljava/lang/String; = "notes"

.field public static final PHONE:Ljava/lang/String; = "phone"

.field public static final PHONETIC_NAME:Ljava/lang/String; = "phonetic_name"

.field public static final PHONE_ISPRIMARY:Ljava/lang/String; = "phone_isprimary"

.field public static final PHONE_TYPE:Ljava/lang/String; = "phone_type"

.field public static final POSTAL:Ljava/lang/String; = "postal"

.field public static final POSTAL_ISPRIMARY:Ljava/lang/String; = "postal_isprimary"

.field public static final POSTAL_TYPE:Ljava/lang/String; = "postal_type"

.field public static final SECONDARY_EMAIL:Ljava/lang/String; = "secondary_email"

.field public static final SECONDARY_EMAIL_TYPE:Ljava/lang/String; = "secondary_email_type"

.field public static final SECONDARY_PHONE:Ljava/lang/String; = "secondary_phone"

.field public static final SECONDARY_PHONE_TYPE:Ljava/lang/String; = "secondary_phone_type"

.field public static final TERTIARY_EMAIL:Ljava/lang/String; = "tertiary_email"

.field public static final TERTIARY_EMAIL_TYPE:Ljava/lang/String; = "tertiary_email_type"

.field public static final TERTIARY_PHONE:Ljava/lang/String; = "tertiary_phone"

.field public static final TERTIARY_PHONE_TYPE:Ljava/lang/String; = "tertiary_phone_type"


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 945
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
