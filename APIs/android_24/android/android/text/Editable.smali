.class public interface abstract Landroid/text/Editable;
.super Ljava/lang/Object;
.source "Editable.java"

# interfaces
.implements Ljava/lang/CharSequence;
.implements Landroid/text/GetChars;
.implements Landroid/text/Spannable;
.implements Ljava/lang/Appendable;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/text/Editable$Factory;
    }
.end annotation


# virtual methods
.method public abstract append(C)Landroid/text/Editable;
.end method

.method public abstract append(Ljava/lang/CharSequence;)Landroid/text/Editable;
.end method

.method public abstract append(Ljava/lang/CharSequence;II)Landroid/text/Editable;
.end method

.method public abstract clear()V
.end method

.method public abstract clearSpans()V
.end method

.method public abstract delete(II)Landroid/text/Editable;
.end method

.method public abstract getFilters()[Landroid/text/InputFilter;
.end method

.method public abstract insert(ILjava/lang/CharSequence;)Landroid/text/Editable;
.end method

.method public abstract insert(ILjava/lang/CharSequence;II)Landroid/text/Editable;
.end method

.method public abstract replace(IILjava/lang/CharSequence;)Landroid/text/Editable;
.end method

.method public abstract replace(IILjava/lang/CharSequence;II)Landroid/text/Editable;
.end method

.method public abstract setFilters([Landroid/text/InputFilter;)V
.end method
