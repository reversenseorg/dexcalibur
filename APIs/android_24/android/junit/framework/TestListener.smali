.class public interface abstract Ljunit/framework/TestListener;
.super Ljava/lang/Object;
.source "TestListener.java"


# virtual methods
.method public abstract addError(Ljunit/framework/Test;Ljava/lang/Throwable;)V
.end method

.method public abstract addFailure(Ljunit/framework/Test;Ljunit/framework/AssertionFailedError;)V
.end method

.method public abstract endTest(Ljunit/framework/Test;)V
.end method

.method public abstract startTest(Ljunit/framework/Test;)V
.end method
