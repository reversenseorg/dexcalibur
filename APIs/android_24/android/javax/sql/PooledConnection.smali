.class public interface abstract Ljavax/sql/PooledConnection;
.super Ljava/lang/Object;
.source "PooledConnection.java"


# virtual methods
.method public abstract addConnectionEventListener(Ljavax/sql/ConnectionEventListener;)V
.end method

.method public abstract addStatementEventListener(Ljavax/sql/StatementEventListener;)V
.end method

.method public abstract close()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getConnection()Ljava/sql/Connection;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract removeConnectionEventListener(Ljavax/sql/ConnectionEventListener;)V
.end method

.method public abstract removeStatementEventListener(Ljavax/sql/StatementEventListener;)V
.end method
