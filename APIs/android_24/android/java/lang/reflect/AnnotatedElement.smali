.class public interface abstract Ljava/lang/reflect/AnnotatedElement;
.super Ljava/lang/Object;
.source "AnnotatedElement.java"


# virtual methods
.method public abstract getAnnotation(Ljava/lang/Class;)Ljava/lang/annotation/Annotation;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "<T::",
            "Ljava/lang/annotation/Annotation;",
            ">(",
            "Ljava/lang/Class",
            "<TT;>;)TT;"
        }
    .end annotation
.end method

.method public abstract getAnnotations()[Ljava/lang/annotation/Annotation;
.end method

.method public abstract getDeclaredAnnotations()[Ljava/lang/annotation/Annotation;
.end method

.method public abstract isAnnotationPresent(Ljava/lang/Class;)Z
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/Class",
            "<+",
            "Ljava/lang/annotation/Annotation;",
            ">;)Z"
        }
    .end annotation
.end method
