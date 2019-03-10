.class public final Landroid/provider/Telephony$Mms$Addr;
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
    name = "Addr"
.end annotation


# static fields
.field public static final ADDRESS:Ljava/lang/String; = "address"

.field public static final CHARSET:Ljava/lang/String; = "charset"

.field public static final CONTACT_ID:Ljava/lang/String; = "contact_id"

.field public static final MSG_ID:Ljava/lang/String; = "msg_id"

.field public static final TYPE:Ljava/lang/String; = "type"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 220
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
