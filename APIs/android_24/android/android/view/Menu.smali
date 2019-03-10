.class public interface abstract Landroid/view/Menu;
.super Ljava/lang/Object;
.source "Menu.java"


# static fields
.field public static final CATEGORY_ALTERNATIVE:I = 0x40000

.field public static final CATEGORY_CONTAINER:I = 0x10000

.field public static final CATEGORY_SECONDARY:I = 0x30000

.field public static final CATEGORY_SYSTEM:I = 0x20000

.field public static final FIRST:I = 0x1

.field public static final FLAG_ALWAYS_PERFORM_CLOSE:I = 0x2

.field public static final FLAG_APPEND_TO_GROUP:I = 0x1

.field public static final FLAG_PERFORM_NO_CLOSE:I = 0x1

.field public static final NONE:I


# virtual methods
.method public abstract add(I)Landroid/view/MenuItem;
.end method

.method public abstract add(IIII)Landroid/view/MenuItem;
.end method

.method public abstract add(IIILjava/lang/CharSequence;)Landroid/view/MenuItem;
.end method

.method public abstract add(Ljava/lang/CharSequence;)Landroid/view/MenuItem;
.end method

.method public abstract addIntentOptions(IIILandroid/content/ComponentName;[Landroid/content/Intent;Landroid/content/Intent;I[Landroid/view/MenuItem;)I
.end method

.method public abstract addSubMenu(I)Landroid/view/SubMenu;
.end method

.method public abstract addSubMenu(IIII)Landroid/view/SubMenu;
.end method

.method public abstract addSubMenu(IIILjava/lang/CharSequence;)Landroid/view/SubMenu;
.end method

.method public abstract addSubMenu(Ljava/lang/CharSequence;)Landroid/view/SubMenu;
.end method

.method public abstract clear()V
.end method

.method public abstract close()V
.end method

.method public abstract findItem(I)Landroid/view/MenuItem;
.end method

.method public abstract getItem(I)Landroid/view/MenuItem;
.end method

.method public abstract hasVisibleItems()Z
.end method

.method public abstract isShortcutKey(ILandroid/view/KeyEvent;)Z
.end method

.method public abstract performIdentifierAction(II)Z
.end method

.method public abstract performShortcut(ILandroid/view/KeyEvent;I)Z
.end method

.method public abstract removeGroup(I)V
.end method

.method public abstract removeItem(I)V
.end method

.method public abstract setGroupCheckable(IZZ)V
.end method

.method public abstract setGroupEnabled(IZ)V
.end method

.method public abstract setGroupVisible(IZ)V
.end method

.method public abstract setQwertyMode(Z)V
.end method

.method public abstract size()I
.end method
