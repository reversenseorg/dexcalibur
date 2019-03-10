.class public final Landroid/provider/ContactsContract$CommonDataKinds;
.super Ljava/lang/Object;
.source "ContactsContract.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "CommonDataKinds"
.end annotation

.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/provider/ContactsContract$CommonDataKinds$Contactables;,
        Landroid/provider/ContactsContract$CommonDataKinds$Callable;,
        Landroid/provider/ContactsContract$CommonDataKinds$Identity;,
        Landroid/provider/ContactsContract$CommonDataKinds$SipAddress;,
        Landroid/provider/ContactsContract$CommonDataKinds$Website;,
        Landroid/provider/ContactsContract$CommonDataKinds$GroupMembership;,
        Landroid/provider/ContactsContract$CommonDataKinds$Note;,
        Landroid/provider/ContactsContract$CommonDataKinds$Photo;,
        Landroid/provider/ContactsContract$CommonDataKinds$Event;,
        Landroid/provider/ContactsContract$CommonDataKinds$Relation;,
        Landroid/provider/ContactsContract$CommonDataKinds$Organization;,
        Landroid/provider/ContactsContract$CommonDataKinds$Im;,
        Landroid/provider/ContactsContract$CommonDataKinds$StructuredPostal;,
        Landroid/provider/ContactsContract$CommonDataKinds$Email;,
        Landroid/provider/ContactsContract$CommonDataKinds$Phone;,
        Landroid/provider/ContactsContract$CommonDataKinds$Nickname;,
        Landroid/provider/ContactsContract$CommonDataKinds$StructuredName;,
        Landroid/provider/ContactsContract$CommonDataKinds$CommonColumns;,
        Landroid/provider/ContactsContract$CommonDataKinds$BaseTypes;
    }
.end annotation


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 837
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
