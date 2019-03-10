.class public Ljavax/net/ssl/SSLSessionBindingEvent;
.super Ljava/util/EventObject;
.source "SSLSessionBindingEvent.java"


# direct methods
.method public constructor <init>(Ljavax/net/ssl/SSLSession;Ljava/lang/String;)V
    .locals 2
    .param p1, "session"    # Ljavax/net/ssl/SSLSession;
    .param p2, "name"    # Ljava/lang/String;

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
.method public getName()Ljava/lang/String;
    .locals 2

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getSession()Ljavax/net/ssl/SSLSession;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
