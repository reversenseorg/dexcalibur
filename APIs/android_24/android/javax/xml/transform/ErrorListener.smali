.class public interface abstract Ljavax/xml/transform/ErrorListener;
.super Ljava/lang/Object;
.source "ErrorListener.java"


# virtual methods
.method public abstract error(Ljavax/xml/transform/TransformerException;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerException;
        }
    .end annotation
.end method

.method public abstract fatalError(Ljavax/xml/transform/TransformerException;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerException;
        }
    .end annotation
.end method

.method public abstract warning(Ljavax/xml/transform/TransformerException;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljavax/xml/transform/TransformerException;
        }
    .end annotation
.end method
