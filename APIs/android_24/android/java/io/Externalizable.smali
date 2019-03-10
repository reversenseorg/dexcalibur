.class public interface abstract Ljava/io/Externalizable;
.super Ljava/lang/Object;
.source "Externalizable.java"

# interfaces
.implements Ljava/io/Serializable;


# virtual methods
.method public abstract readExternal(Ljava/io/ObjectInput;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;,
            Ljava/lang/ClassNotFoundException;
        }
    .end annotation
.end method

.method public abstract writeExternal(Ljava/io/ObjectOutput;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
