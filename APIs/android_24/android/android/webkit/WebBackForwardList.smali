.class public abstract Landroid/webkit/WebBackForwardList;
.super Ljava/lang/Object;
.source "WebBackForwardList.java"

# interfaces
.implements Ljava/lang/Cloneable;
.implements Ljava/io/Serializable;


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method protected abstract clone()Landroid/webkit/WebBackForwardList;
.end method

.method protected bridge synthetic clone()Ljava/lang/Object;
    .locals 1
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/CloneNotSupportedException;
        }
    .end annotation

    .prologue
    .line 2
    invoke-virtual {p0}, Landroid/webkit/WebBackForwardList;->clone()Landroid/webkit/WebBackForwardList;

    move-result-object v0

    return-object v0
.end method

.method public abstract getCurrentIndex()I
.end method

.method public abstract getCurrentItem()Landroid/webkit/WebHistoryItem;
.end method

.method public abstract getItemAtIndex(I)Landroid/webkit/WebHistoryItem;
.end method

.method public abstract getSize()I
.end method
