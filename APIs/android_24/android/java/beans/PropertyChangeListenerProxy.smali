.class public Ljava/beans/PropertyChangeListenerProxy;
.super Ljava/util/EventListenerProxy;
.source "PropertyChangeListenerProxy.java"

# interfaces
.implements Ljava/beans/PropertyChangeListener;


# direct methods
.method public constructor <init>(Ljava/lang/String;Ljava/beans/PropertyChangeListener;)V
    .locals 2
    .param p1, "propertyName"    # Ljava/lang/String;
    .param p2, "listener"    # Ljava/beans/PropertyChangeListener;

    .prologue
    .line 6
    const/4 v0, 0x0

    check-cast v0, Ljava/util/EventListener;

    invoke-direct {p0, v0}, Ljava/util/EventListenerProxy;-><init>(Ljava/util/EventListener;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getPropertyName()Ljava/lang/String;
    .locals 2

    .prologue
    .line 7
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public propertyChange(Ljava/beans/PropertyChangeEvent;)V
    .locals 2
    .param p1, "event"    # Ljava/beans/PropertyChangeEvent;

    .prologue
    .line 8
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
