.class public interface abstract Landroid/widget/ExpandableListAdapter;
.super Ljava/lang/Object;
.source "ExpandableListAdapter.java"


# virtual methods
.method public abstract areAllItemsEnabled()Z
.end method

.method public abstract getChild(II)Ljava/lang/Object;
.end method

.method public abstract getChildId(II)J
.end method

.method public abstract getChildView(IIZLandroid/view/View;Landroid/view/ViewGroup;)Landroid/view/View;
.end method

.method public abstract getChildrenCount(I)I
.end method

.method public abstract getCombinedChildId(JJ)J
.end method

.method public abstract getCombinedGroupId(J)J
.end method

.method public abstract getGroup(I)Ljava/lang/Object;
.end method

.method public abstract getGroupCount()I
.end method

.method public abstract getGroupId(I)J
.end method

.method public abstract getGroupView(IZLandroid/view/View;Landroid/view/ViewGroup;)Landroid/view/View;
.end method

.method public abstract hasStableIds()Z
.end method

.method public abstract isChildSelectable(II)Z
.end method

.method public abstract isEmpty()Z
.end method

.method public abstract onGroupCollapsed(I)V
.end method

.method public abstract onGroupExpanded(I)V
.end method

.method public abstract registerDataSetObserver(Landroid/database/DataSetObserver;)V
.end method

.method public abstract unregisterDataSetObserver(Landroid/database/DataSetObserver;)V
.end method
