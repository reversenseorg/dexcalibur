.class public abstract Landroid/animation/BidirectionalTypeConverter;
.super Landroid/animation/TypeConverter;
.source "BidirectionalTypeConverter.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<T:",
        "Ljava/lang/Object;",
        "V:",
        "Ljava/lang/Object;",
        ">",
        "Landroid/animation/TypeConverter",
        "<TT;TV;>;"
    }
.end annotation


# direct methods
.method public constructor <init>(Ljava/lang/Class;Ljava/lang/Class;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/Class",
            "<TT;>;",
            "Ljava/lang/Class",
            "<TV;>;)V"
        }
    .end annotation

    .prologue
    .local p0, "this":Landroid/animation/BidirectionalTypeConverter;, "Landroid/animation/BidirectionalTypeConverter<TT;TV;>;"
    .local p1, "fromClass":Ljava/lang/Class;, "Ljava/lang/Class<TT;>;"
    .local p2, "toClass":Ljava/lang/Class;, "Ljava/lang/Class<TV;>;"
    const/4 v1, 0x0

    .line 5
    move-object v0, v1

    check-cast v0, Ljava/lang/Class;

    check-cast v1, Ljava/lang/Class;

    invoke-direct {p0, v0, v1}, Landroid/animation/TypeConverter;-><init>(Ljava/lang/Class;Ljava/lang/Class;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract convertBack(Ljava/lang/Object;)Ljava/lang/Object;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(TV;)TT;"
        }
    .end annotation
.end method

.method public invert()Landroid/animation/BidirectionalTypeConverter;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Landroid/animation/BidirectionalTypeConverter",
            "<TV;TT;>;"
        }
    .end annotation

    .prologue
    .line 7
    .local p0, "this":Landroid/animation/BidirectionalTypeConverter;, "Landroid/animation/BidirectionalTypeConverter<TT;TV;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
