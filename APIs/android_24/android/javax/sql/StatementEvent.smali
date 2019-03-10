.class public Ljavax/sql/StatementEvent;
.super Ljava/util/EventObject;
.source "StatementEvent.java"


# direct methods
.method public constructor <init>(Ljavax/sql/PooledConnection;Ljava/sql/PreparedStatement;)V
    .locals 2
    .param p1, "con"    # Ljavax/sql/PooledConnection;
    .param p2, "statement"    # Ljava/sql/PreparedStatement;

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

.method public constructor <init>(Ljavax/sql/PooledConnection;Ljava/sql/PreparedStatement;Ljava/sql/SQLException;)V
    .locals 2
    .param p1, "con"    # Ljavax/sql/PooledConnection;
    .param p2, "statement"    # Ljava/sql/PreparedStatement;
    .param p3, "exception"    # Ljava/sql/SQLException;

    .prologue
    .line 5
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

.method public getStatement()Ljava/sql/PreparedStatement;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
