.class public interface abstract Landroid/view/Window$Callback;
.super Ljava/lang/Object;
.source "Window.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/view/Window;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "Callback"
.end annotation


# virtual methods
.method public abstract dispatchGenericMotionEvent(Landroid/view/MotionEvent;)Z
.end method

.method public abstract dispatchKeyEvent(Landroid/view/KeyEvent;)Z
.end method

.method public abstract dispatchKeyShortcutEvent(Landroid/view/KeyEvent;)Z
.end method

.method public abstract dispatchPopulateAccessibilityEvent(Landroid/view/accessibility/AccessibilityEvent;)Z
.end method

.method public abstract dispatchTouchEvent(Landroid/view/MotionEvent;)Z
.end method

.method public abstract dispatchTrackballEvent(Landroid/view/MotionEvent;)Z
.end method

.method public abstract onActionModeFinished(Landroid/view/ActionMode;)V
.end method

.method public abstract onActionModeStarted(Landroid/view/ActionMode;)V
.end method

.method public abstract onAttachedToWindow()V
.end method

.method public abstract onContentChanged()V
.end method

.method public abstract onCreatePanelMenu(ILandroid/view/Menu;)Z
.end method

.method public abstract onCreatePanelView(I)Landroid/view/View;
.end method

.method public abstract onDetachedFromWindow()V
.end method

.method public abstract onMenuItemSelected(ILandroid/view/MenuItem;)Z
.end method

.method public abstract onMenuOpened(ILandroid/view/Menu;)Z
.end method

.method public abstract onPanelClosed(ILandroid/view/Menu;)V
.end method

.method public abstract onPreparePanel(ILandroid/view/View;Landroid/view/Menu;)Z
.end method

.method public abstract onSearchRequested()Z
.end method

.method public abstract onWindowAttributesChanged(Landroid/view/WindowManager$LayoutParams;)V
.end method

.method public abstract onWindowFocusChanged(Z)V
.end method

.method public abstract onWindowStartingActionMode(Landroid/view/ActionMode$Callback;)Landroid/view/ActionMode;
.end method
