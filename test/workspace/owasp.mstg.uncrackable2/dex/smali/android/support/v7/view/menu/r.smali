.class Landroid/support/v7/view/menu/r;
.super Landroid/support/v7/view/menu/c;

# interfaces
.implements Landroid/view/Menu;


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "Landroid/support/v7/view/menu/c<",
        "Landroid/support/v4/c/a/a;",
        ">;",
        "Landroid/view/Menu;"
    }
.end annotation


# direct methods
.method constructor <init>(Landroid/content/Context;Landroid/support/v4/c/a/a;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Landroid/support/v7/view/menu/c;-><init>(Landroid/content/Context;Ljava/lang/Object;)V

    return-void
.end method


# virtual methods
.method public add(I)Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->add(I)Landroid/view/MenuItem;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object p1

    return-object p1
.end method

.method public add(IIII)Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2, p3, p4}, Landroid/support/v4/c/a/a;->add(IIII)Landroid/view/MenuItem;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object p1

    return-object p1
.end method

.method public add(IIILjava/lang/CharSequence;)Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2, p3, p4}, Landroid/support/v4/c/a/a;->add(IIILjava/lang/CharSequence;)Landroid/view/MenuItem;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object p1

    return-object p1
.end method

.method public add(Ljava/lang/CharSequence;)Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->add(Ljava/lang/CharSequence;)Landroid/view/MenuItem;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object p1

    return-object p1
.end method

.method public addIntentOptions(IIILandroid/content/ComponentName;[Landroid/content/Intent;Landroid/content/Intent;I[Landroid/view/MenuItem;)I
    .locals 12

    move-object v0, p0

    move-object/from16 v1, p8

    if-eqz v1, :cond_0

    array-length v2, v1

    new-array v2, v2, [Landroid/view/MenuItem;

    goto :goto_0

    :cond_0
    const/4 v2, 0x0

    :goto_0
    iget-object v3, v0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v3, Landroid/support/v4/c/a/a;

    move v4, p1

    move v5, p2

    move v6, p3

    move-object/from16 v7, p4

    move-object/from16 v8, p5

    move-object/from16 v9, p6

    move/from16 v10, p7

    move-object v11, v2

    invoke-interface/range {v3 .. v11}, Landroid/support/v4/c/a/a;->addIntentOptions(IIILandroid/content/ComponentName;[Landroid/content/Intent;Landroid/content/Intent;I[Landroid/view/MenuItem;)I

    move-result v3

    if-eqz v2, :cond_1

    const/4 v4, 0x0

    array-length v5, v2

    :goto_1
    if-ge v4, v5, :cond_1

    aget-object v6, v2, v4

    invoke-virtual {p0, v6}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object v6

    aput-object v6, v1, v4

    add-int/lit8 v4, v4, 0x1

    goto :goto_1

    :cond_1
    return v3
.end method

.method public addSubMenu(I)Landroid/view/SubMenu;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->addSubMenu(I)Landroid/view/SubMenu;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/SubMenu;)Landroid/view/SubMenu;

    move-result-object p1

    return-object p1
.end method

.method public addSubMenu(IIII)Landroid/view/SubMenu;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2, p3, p4}, Landroid/support/v4/c/a/a;->addSubMenu(IIII)Landroid/view/SubMenu;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/SubMenu;)Landroid/view/SubMenu;

    move-result-object p1

    return-object p1
.end method

.method public addSubMenu(IIILjava/lang/CharSequence;)Landroid/view/SubMenu;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2, p3, p4}, Landroid/support/v4/c/a/a;->addSubMenu(IIILjava/lang/CharSequence;)Landroid/view/SubMenu;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/SubMenu;)Landroid/view/SubMenu;

    move-result-object p1

    return-object p1
.end method

.method public addSubMenu(Ljava/lang/CharSequence;)Landroid/view/SubMenu;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->addSubMenu(Ljava/lang/CharSequence;)Landroid/view/SubMenu;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/SubMenu;)Landroid/view/SubMenu;

    move-result-object p1

    return-object p1
.end method

.method public clear()V
    .locals 1

    invoke-virtual {p0}, Landroid/support/v7/view/menu/r;->a()V

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0}, Landroid/support/v4/c/a/a;->clear()V

    return-void
.end method

.method public close()V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0}, Landroid/support/v4/c/a/a;->close()V

    return-void
.end method

.method public findItem(I)Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->findItem(I)Landroid/view/MenuItem;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object p1

    return-object p1
.end method

.method public getItem(I)Landroid/view/MenuItem;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->getItem(I)Landroid/view/MenuItem;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(Landroid/view/MenuItem;)Landroid/view/MenuItem;

    move-result-object p1

    return-object p1
.end method

.method public hasVisibleItems()Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0}, Landroid/support/v4/c/a/a;->hasVisibleItems()Z

    move-result v0

    return v0
.end method

.method public isShortcutKey(ILandroid/view/KeyEvent;)Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2}, Landroid/support/v4/c/a/a;->isShortcutKey(ILandroid/view/KeyEvent;)Z

    move-result p1

    return p1
.end method

.method public performIdentifierAction(II)Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2}, Landroid/support/v4/c/a/a;->performIdentifierAction(II)Z

    move-result p1

    return p1
.end method

.method public performShortcut(ILandroid/view/KeyEvent;I)Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2, p3}, Landroid/support/v4/c/a/a;->performShortcut(ILandroid/view/KeyEvent;I)Z

    move-result p1

    return p1
.end method

.method public removeGroup(I)V
    .locals 1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->a(I)V

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->removeGroup(I)V

    return-void
.end method

.method public removeItem(I)V
    .locals 1

    invoke-virtual {p0, p1}, Landroid/support/v7/view/menu/r;->b(I)V

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->removeItem(I)V

    return-void
.end method

.method public setGroupCheckable(IZZ)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2, p3}, Landroid/support/v4/c/a/a;->setGroupCheckable(IZZ)V

    return-void
.end method

.method public setGroupEnabled(IZ)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2}, Landroid/support/v4/c/a/a;->setGroupEnabled(IZ)V

    return-void
.end method

.method public setGroupVisible(IZ)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1, p2}, Landroid/support/v4/c/a/a;->setGroupVisible(IZ)V

    return-void
.end method

.method public setQwertyMode(Z)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0, p1}, Landroid/support/v4/c/a/a;->setQwertyMode(Z)V

    return-void
.end method

.method public size()I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/view/menu/r;->b:Ljava/lang/Object;

    check-cast v0, Landroid/support/v4/c/a/a;

    invoke-interface {v0}, Landroid/support/v4/c/a/a;->size()I

    move-result v0

    return v0
.end method
