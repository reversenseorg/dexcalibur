.class public interface abstract Landroid/nfc/tech/TagTechnology;
.super Ljava/lang/Object;
.source "TagTechnology.java"

# interfaces
.implements Ljava/io/Closeable;


# virtual methods
.method public abstract close()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract connect()V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract getTag()Landroid/nfc/Tag;
.end method

.method public abstract isConnected()Z
.end method
