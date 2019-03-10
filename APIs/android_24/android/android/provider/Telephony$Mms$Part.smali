.class public final Landroid/provider/Telephony$Mms$Part;
.super Ljava/lang/Object;
.source "Telephony.java"

# interfaces
.implements Landroid/provider/BaseColumns;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/Telephony$Mms;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "Part"
.end annotation


# static fields
.field public static final CHARSET:Ljava/lang/String; = "chset"

.field public static final CONTENT_DISPOSITION:Ljava/lang/String; = "cd"

.field public static final CONTENT_ID:Ljava/lang/String; = "cid"

.field public static final CONTENT_LOCATION:Ljava/lang/String; = "cl"

.field public static final CONTENT_TYPE:Ljava/lang/String; = "ct"

.field public static final CT_START:Ljava/lang/String; = "ctt_s"

.field public static final CT_TYPE:Ljava/lang/String; = "ctt_t"

.field public static final FILENAME:Ljava/lang/String; = "fn"

.field public static final MSG_ID:Ljava/lang/String; = "mid"

.field public static final NAME:Ljava/lang/String; = "name"

.field public static final SEQ:Ljava/lang/String; = "seq"

.field public static final TEXT:Ljava/lang/String; = "text"

.field public static final _DATA:Ljava/lang/String; = "_data"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 230
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
