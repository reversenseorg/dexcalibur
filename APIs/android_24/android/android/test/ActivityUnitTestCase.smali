.class public abstract Landroid/test/ActivityUnitTestCase;
.super Landroid/test/ActivityTestCase;
.source "ActivityUnitTestCase.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<T:",
        "Landroid/app/Activity;",
        ">",
        "Landroid/test/ActivityTestCase;"
    }
.end annotation


# direct methods
.method public constructor <init>(Ljava/lang/Class;)V
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/Class",
            "<TT;>;)V"
        }
    .end annotation

    .prologue
    .line 5
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    .local p1, "activityClass":Ljava/lang/Class;, "Ljava/lang/Class<TT;>;"
    invoke-direct {p0}, Landroid/test/ActivityTestCase;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getActivity()Landroid/app/Activity;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()TT;"
        }
    .end annotation

    .prologue
    .line 6
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getFinishedActivityRequest()I
    .locals 2

    .prologue
    .line 16
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getRequestedOrientation()I
    .locals 2

    .prologue
    .line 12
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getStartedActivityIntent()Landroid/content/Intent;
    .locals 2

    .prologue
    .line 13
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getStartedActivityRequest()I
    .locals 2

    .prologue
    .line 14
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public isFinishCalled()Z
    .locals 2

    .prologue
    .line 15
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setActivityContext(Landroid/content/Context;)V
    .locals 2
    .param p1, "activityContext"    # Landroid/content/Context;

    .prologue
    .line 11
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setApplication(Landroid/app/Application;)V
    .locals 2
    .param p1, "application"    # Landroid/app/Application;

    .prologue
    .line 10
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected setUp()V
    .locals 2
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    .prologue
    .line 7
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected startActivity(Landroid/content/Intent;Landroid/os/Bundle;Ljava/lang/Object;)Landroid/app/Activity;
    .locals 2
    .param p1, "intent"    # Landroid/content/Intent;
    .param p2, "savedInstanceState"    # Landroid/os/Bundle;
    .param p3, "lastNonConfigurationInstance"    # Ljava/lang/Object;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Intent;",
            "Landroid/os/Bundle;",
            "Ljava/lang/Object;",
            ")TT;"
        }
    .end annotation

    .prologue
    .line 8
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method protected tearDown()V
    .locals 2
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    .prologue
    .line 9
    .local p0, "this":Landroid/test/ActivityUnitTestCase;, "Landroid/test/ActivityUnitTestCase<TT;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
