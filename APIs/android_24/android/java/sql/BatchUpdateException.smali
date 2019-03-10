.class public Ljava/sql/BatchUpdateException;
.super Ljava/sql/SQLException;
.source "BatchUpdateException.java"

# interfaces
.implements Ljava/io/Serializable;


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 6
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;I[I)V
    .locals 2
    .param p1, "reason"    # Ljava/lang/String;
    .param p2, "SQLState"    # Ljava/lang/String;
    .param p3, "vendorCode"    # I
    .param p4, "updateCounts"    # [I

    .prologue
    .line 15
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;I[ILjava/lang/Throwable;)V
    .locals 2
    .param p1, "reason"    # Ljava/lang/String;
    .param p2, "SQLState"    # Ljava/lang/String;
    .param p3, "vendorCode"    # I
    .param p4, "updateCounts"    # [I
    .param p5, "cause"    # Ljava/lang/Throwable;

    .prologue
    .line 11
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;[I)V
    .locals 2
    .param p1, "reason"    # Ljava/lang/String;
    .param p2, "SQLState"    # Ljava/lang/String;
    .param p3, "updateCounts"    # [I

    .prologue
    .line 14
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;Ljava/lang/String;[ILjava/lang/Throwable;)V
    .locals 2
    .param p1, "reason"    # Ljava/lang/String;
    .param p2, "SQLState"    # Ljava/lang/String;
    .param p3, "updateCounts"    # [I
    .param p4, "cause"    # Ljava/lang/Throwable;

    .prologue
    .line 10
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;[I)V
    .locals 2
    .param p1, "reason"    # Ljava/lang/String;
    .param p2, "updateCounts"    # [I

    .prologue
    .line 13
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/String;[ILjava/lang/Throwable;)V
    .locals 2
    .param p1, "reason"    # Ljava/lang/String;
    .param p2, "updateCounts"    # [I
    .param p3, "cause"    # Ljava/lang/Throwable;

    .prologue
    .line 9
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>(Ljava/lang/Throwable;)V
    .locals 2
    .param p1, "cause"    # Ljava/lang/Throwable;

    .prologue
    .line 7
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>([I)V
    .locals 2
    .param p1, "updateCounts"    # [I

    .prologue
    .line 12
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public constructor <init>([ILjava/lang/Throwable;)V
    .locals 2
    .param p1, "updateCounts"    # [I
    .param p2, "cause"    # Ljava/lang/Throwable;

    .prologue
    .line 8
    invoke-direct {p0}, Ljava/sql/SQLException;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getUpdateCounts()[I
    .locals 2

    .prologue
    .line 16
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
