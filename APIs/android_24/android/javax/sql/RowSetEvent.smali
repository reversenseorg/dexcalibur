.class public Ljavax/sql/RowSetEvent;
.super Ljava/util/EventObject;
.source "RowSetEvent.java"

# interfaces
.implements Ljava/io/Serializable;


# direct methods
.method public constructor <init>(Ljavax/sql/RowSet;)V
    .locals 2
    .param p1, "theSource"    # Ljavax/sql/RowSet;

    .prologue
    .line 6
    const/4 v0, 0x0

    check-cast v0, Ljava/lang/Object;

    invoke-direct {p0, v0}, Ljava/util/EventObject;-><init>(Ljava/lang/Object;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
