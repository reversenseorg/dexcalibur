.class Landroid/support/v7/app/j$b$1;
.super Landroid/support/v4/g/u;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Landroid/support/v7/app/j$b;->a(Landroid/support/v7/view/b;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/app/j$b;


# direct methods
.method constructor <init>(Landroid/support/v7/app/j$b;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    invoke-direct {p0}, Landroid/support/v4/g/u;-><init>()V

    return-void
.end method


# virtual methods
.method public b(Landroid/view/View;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    const/16 v0, 0x8

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContextView;->setVisibility(I)V

    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    invoke-virtual {p1}, Landroid/widget/PopupWindow;->dismiss()V

    goto :goto_0

    :cond_0
    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1}, Landroid/support/v7/widget/ActionBarContextView;->getParent()Landroid/view/ViewParent;

    move-result-object p1

    instance-of p1, p1, Landroid/view/View;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1}, Landroid/support/v7/widget/ActionBarContextView;->getParent()Landroid/view/ViewParent;

    move-result-object p1

    check-cast p1, Landroid/view/View;

    invoke-static {p1}, Landroid/support/v4/g/p;->g(Landroid/view/View;)V

    :cond_1
    :goto_0
    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1}, Landroid/support/v7/widget/ActionBarContextView;->removeAllViews()V

    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iget-object p1, p1, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/support/v4/g/s;->a(Landroid/support/v4/g/t;)Landroid/support/v4/g/s;

    iget-object p1, p0, Landroid/support/v7/app/j$b$1;->a:Landroid/support/v7/app/j$b;

    iget-object p1, p1, Landroid/support/v7/app/j$b;->a:Landroid/support/v7/app/j;

    iput-object v0, p1, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    return-void
.end method
