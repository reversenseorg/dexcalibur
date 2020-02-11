.class Landroid/support/v7/app/p$1;
.super Landroid/support/v4/g/u;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/app/p;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/app/p;


# direct methods
.method constructor <init>(Landroid/support/v7/app/p;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    invoke-direct {p0}, Landroid/support/v4/g/u;-><init>()V

    return-void
.end method


# virtual methods
.method public b(Landroid/view/View;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-boolean p1, p1, Landroid/support/v7/app/p;->k:Z

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->f:Landroid/view/View;

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->f:Landroid/view/View;

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/view/View;->setTranslationY(F)V

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->c:Landroid/support/v7/widget/ActionBarContainer;

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContainer;->setTranslationY(F)V

    :cond_0
    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->c:Landroid/support/v7/widget/ActionBarContainer;

    const/16 v0, 0x8

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContainer;->setVisibility(I)V

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->c:Landroid/support/v7/widget/ActionBarContainer;

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContainer;->setTransitioning(Z)V

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    const/4 v0, 0x0

    iput-object v0, p1, Landroid/support/v7/app/p;->n:Landroid/support/v7/view/h;

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    invoke-virtual {p1}, Landroid/support/v7/app/p;->h()V

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->b:Landroid/support/v7/widget/ActionBarOverlayLayout;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/p$1;->a:Landroid/support/v7/app/p;

    iget-object p1, p1, Landroid/support/v7/app/p;->b:Landroid/support/v7/widget/ActionBarOverlayLayout;

    invoke-static {p1}, Landroid/support/v4/g/p;->g(Landroid/view/View;)V

    :cond_1
    return-void
.end method
