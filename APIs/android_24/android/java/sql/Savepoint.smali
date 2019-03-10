.class public interface abstract Ljava/sql/Savepoint;
.super Ljava/lang/Object;
.source "Savepoint.java"


# virtual methods
.method public abstract getSavepointId()I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getSavepointName()Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method
