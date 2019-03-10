.class public final Landroid/provider/ContactsContract$RawContacts$DisplayPhoto;
.super Ljava/lang/Object;
.source "ContactsContract.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract$RawContacts;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "DisplayPhoto"
.end annotation


# static fields
.field public static final CONTENT_DIRECTORY:Ljava/lang/String; = "display_photo"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 270
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
