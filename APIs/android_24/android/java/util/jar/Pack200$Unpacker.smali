.class public interface abstract Ljava/util/jar/Pack200$Unpacker;
.super Ljava/lang/Object;
.source "Pack200.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/util/jar/Pack200;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "Unpacker"
.end annotation


# static fields
.field public static final DEFLATE_HINT:Ljava/lang/String; = "unpack.deflate.hint"

.field public static final FALSE:Ljava/lang/String; = "false"

.field public static final KEEP:Ljava/lang/String; = "keep"

.field public static final PROGRESS:Ljava/lang/String; = "unpack.progress"

.field public static final TRUE:Ljava/lang/String; = "true"


# virtual methods
.method public abstract addPropertyChangeListener(Ljava/beans/PropertyChangeListener;)V
.end method

.method public abstract properties()Ljava/util/SortedMap;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/SortedMap",
            "<",
            "Ljava/lang/String;",
            "Ljava/lang/String;",
            ">;"
        }
    .end annotation
.end method

.method public abstract removePropertyChangeListener(Ljava/beans/PropertyChangeListener;)V
.end method

.method public abstract unpack(Ljava/io/File;Ljava/util/jar/JarOutputStream;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method

.method public abstract unpack(Ljava/io/InputStream;Ljava/util/jar/JarOutputStream;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation
.end method
