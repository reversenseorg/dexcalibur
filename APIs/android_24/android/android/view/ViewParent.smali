.class public interface abstract Landroid/view/ViewParent;
.super Ljava/lang/Object;
.source "ViewParent.java"


# virtual methods
.method public abstract bringChildToFront(Landroid/view/View;)V
.end method

.method public abstract canResolveLayoutDirection()Z
.end method

.method public abstract canResolveTextAlignment()Z
.end method

.method public abstract canResolveTextDirection()Z
.end method

.method public abstract childDrawableStateChanged(Landroid/view/View;)V
.end method

.method public abstract childHasTransientStateChanged(Landroid/view/View;Z)V
.end method

.method public abstract clearChildFocus(Landroid/view/View;)V
.end method

.method public abstract createContextMenu(Landroid/view/ContextMenu;)V
.end method

.method public abstract focusSearch(Landroid/view/View;I)Landroid/view/View;
.end method

.method public abstract focusableViewAvailable(Landroid/view/View;)V
.end method

.method public abstract getChildVisibleRect(Landroid/view/View;Landroid/graphics/Rect;Landroid/graphics/Point;)Z
.end method

.method public abstract getLayoutDirection()I
.end method

.method public abstract getParent()Landroid/view/ViewParent;
.end method

.method public abstract getParentForAccessibility()Landroid/view/ViewParent;
.end method

.method public abstract getTextAlignment()I
.end method

.method public abstract getTextDirection()I
.end method

.method public abstract invalidateChild(Landroid/view/View;Landroid/graphics/Rect;)V
.end method

.method public abstract invalidateChildInParent([ILandroid/graphics/Rect;)Landroid/view/ViewParent;
.end method

.method public abstract isLayoutDirectionResolved()Z
.end method

.method public abstract isLayoutRequested()Z
.end method

.method public abstract isTextAlignmentResolved()Z
.end method

.method public abstract isTextDirectionResolved()Z
.end method

.method public abstract notifySubtreeAccessibilityStateChanged(Landroid/view/View;Landroid/view/View;I)V
.end method

.method public abstract onNestedFling(Landroid/view/View;FFZ)Z
.end method

.method public abstract onNestedPreFling(Landroid/view/View;FF)Z
.end method

.method public abstract onNestedPrePerformAccessibilityAction(Landroid/view/View;ILandroid/os/Bundle;)Z
.end method

.method public abstract onNestedPreScroll(Landroid/view/View;II[I)V
.end method

.method public abstract onNestedScroll(Landroid/view/View;IIII)V
.end method

.method public abstract onNestedScrollAccepted(Landroid/view/View;Landroid/view/View;I)V
.end method

.method public abstract onStartNestedScroll(Landroid/view/View;Landroid/view/View;I)Z
.end method

.method public abstract onStopNestedScroll(Landroid/view/View;)V
.end method

.method public abstract recomputeViewAttributes(Landroid/view/View;)V
.end method

.method public abstract requestChildFocus(Landroid/view/View;Landroid/view/View;)V
.end method

.method public abstract requestChildRectangleOnScreen(Landroid/view/View;Landroid/graphics/Rect;Z)Z
.end method

.method public abstract requestDisallowInterceptTouchEvent(Z)V
.end method

.method public abstract requestFitSystemWindows()V
.end method

.method public abstract requestLayout()V
.end method

.method public abstract requestSendAccessibilityEvent(Landroid/view/View;Landroid/view/accessibility/AccessibilityEvent;)Z
.end method

.method public abstract requestTransparentRegion(Landroid/view/View;)V
.end method

.method public abstract showContextMenuForChild(Landroid/view/View;)Z
.end method

.method public abstract startActionModeForChild(Landroid/view/View;Landroid/view/ActionMode$Callback;)Landroid/view/ActionMode;
.end method
