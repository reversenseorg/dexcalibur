.class public Ljavax/sql/ConnectionEvent;
.super Ljava/util/EventObject;
.source "ConnectionEvent.java"

# interfaces
.implements Ljava/io/Serializable;


# direct methods
.method public constructor <init>(Ljavax/sql/PooledConnection;)V
    .locals 2
    .param p1, "theConnection"    # Ljavax/sql/PooledConnection;

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

.method public constructor <init>(Ljavax/sql/PooledConnection;Ljava/sql/SQLException;)V
    .locals 2
    .param p1, "theConnection"    # Ljavax/sql/PooledConnection;
    .param p2, "theException"    # Ljava/sql/SQLException;

    .prologue
    .line 7
    const/4 v0, 0x0

    check-cast v0, Ljava/lang/Object;

    invoke-direct {p0, v0}, Ljava/util/EventObject;-><init>(Ljava/lang/Object;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getSQLException()Ljava/sql/SQLException;
    .locals 2

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
