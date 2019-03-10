.class public Landroid/drm/DrmInfoEvent;
.super Landroid/drm/DrmEvent;
.source "DrmInfoEvent.java"


# static fields
.field public static final TYPE_ACCOUNT_ALREADY_REGISTERED:I = 0x5

.field public static final TYPE_ALREADY_REGISTERED_BY_ANOTHER_ACCOUNT:I = 0x1

.field public static final TYPE_REMOVE_RIGHTS:I = 0x2

.field public static final TYPE_RIGHTS_INSTALLED:I = 0x3

.field public static final TYPE_RIGHTS_REMOVED:I = 0x6

.field public static final TYPE_WAIT_FOR_RIGHTS:I = 0x4


# direct methods
.method public constructor <init>(IILjava/lang/String;)V
    .locals 2
    .param p1, "uniqueId"    # I
    .param p2, "type"    # I
    .param p3, "message"    # Ljava/lang/String;

    .prologue
    const/4 v1, 0x0

    .line 5
    const/4 v0, 0x0

    check-cast v0, Ljava/lang/String;

    invoke-direct {p0, v1, v1, v0}, Landroid/drm/DrmEvent;-><init>(IILjava/lang/String;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(IILjava/lang/String;Ljava/util/HashMap;)V
    .locals 2
    .param p1, "uniqueId"    # I
    .param p2, "type"    # I
    .param p3, "message"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(II",
            "Ljava/lang/String;",
            "Ljava/util/HashMap",
            "<",
            "Ljava/lang/String;",
            "Ljava/lang/Object;",
            ">;)V"
        }
    .end annotation

    .prologue
    .local p4, "attributes":Ljava/util/HashMap;, "Ljava/util/HashMap<Ljava/lang/String;Ljava/lang/Object;>;"
    const/4 v1, 0x0

    .line 6
    const/4 v0, 0x0

    check-cast v0, Ljava/lang/String;

    invoke-direct {p0, v1, v1, v0}, Landroid/drm/DrmEvent;-><init>(IILjava/lang/String;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
