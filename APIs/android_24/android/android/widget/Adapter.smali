.class public interface abstract Landroid/widget/Adapter;
.super Ljava/lang/Object;
.source "Adapter.java"


# static fields
.field public static final IGNORE_ITEM_VIEW_TYPE:I = -0x1

.field public static final NO_SELECTION:I = -0x80000000


# virtual methods
.method public abstract getCount()I
.end method

.method public abstract getItem(I)Ljava/lang/Object;
.end method

.method public abstract getItemId(I)J
.end method

.method public abstract getItemViewType(I)I
.end method

.method public abstract getView(ILandroid/view/View;Landroid/view/ViewGroup;)Landroid/view/View;
.end method

.method public abstract getViewTypeCount()I
.end method

.method public abstract hasStableIds()Z
.end method

.method public abstract isEmpty()Z
.end method

.method public abstract registerDataSetObserver(Landroid/database/DataSetObserver;)V
.end method

.method public abstract unregisterDataSetObserver(Landroid/database/DataSetObserver;)V
.end method
