.class public interface abstract Ljunit/runner/TestSuiteLoader;
.super Ljava/lang/Object;
.source "TestSuiteLoader.java"


# virtual methods
.method public abstract load(Ljava/lang/String;)Ljava/lang/Class;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;
        }
    .end annotation
.end method

.method public abstract reload(Ljava/lang/Class;)Ljava/lang/Class;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;
        }
    .end annotation
.end method
