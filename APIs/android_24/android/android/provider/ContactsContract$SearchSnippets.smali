.class public Landroid/provider/ContactsContract$SearchSnippets;
.super Ljava/lang/Object;
.source "ContactsContract.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/provider/ContactsContract;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "SearchSnippets"
.end annotation


# static fields
.field public static final DEFERRED_SNIPPETING_KEY:Ljava/lang/String; = "deferred_snippeting"

.field public static final SNIPPET:Ljava/lang/String; = "snippet"


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 511
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
