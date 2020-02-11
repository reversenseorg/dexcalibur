.class Landroid/support/v4/app/m$3;
.super Landroid/animation/AnimatorListenerAdapter;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Landroid/support/v4/app/m;->a(Landroid/support/v4/app/g;Landroid/support/v4/app/m$c;I)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/view/ViewGroup;

.field final synthetic b:Landroid/view/View;

.field final synthetic c:Landroid/support/v4/app/g;

.field final synthetic d:Landroid/support/v4/app/m;


# direct methods
.method constructor <init>(Landroid/support/v4/app/m;Landroid/view/ViewGroup;Landroid/view/View;Landroid/support/v4/app/g;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v4/app/m$3;->d:Landroid/support/v4/app/m;

    iput-object p2, p0, Landroid/support/v4/app/m$3;->a:Landroid/view/ViewGroup;

    iput-object p3, p0, Landroid/support/v4/app/m$3;->b:Landroid/view/View;

    iput-object p4, p0, Landroid/support/v4/app/m$3;->c:Landroid/support/v4/app/g;

    invoke-direct {p0}, Landroid/animation/AnimatorListenerAdapter;-><init>()V

    return-void
.end method


# virtual methods
.method public onAnimationEnd(Landroid/animation/Animator;)V
    .locals 6

    iget-object p1, p0, Landroid/support/v4/app/m$3;->a:Landroid/view/ViewGroup;

    iget-object v0, p0, Landroid/support/v4/app/m$3;->b:Landroid/view/View;

    invoke-virtual {p1, v0}, Landroid/view/ViewGroup;->endViewTransition(Landroid/view/View;)V

    iget-object p1, p0, Landroid/support/v4/app/m$3;->c:Landroid/support/v4/app/g;

    invoke-virtual {p1}, Landroid/support/v4/app/g;->U()Landroid/animation/Animator;

    move-result-object p1

    iget-object v0, p0, Landroid/support/v4/app/m$3;->c:Landroid/support/v4/app/g;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/support/v4/app/g;->a(Landroid/animation/Animator;)V

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v4/app/m$3;->a:Landroid/view/ViewGroup;

    iget-object v0, p0, Landroid/support/v4/app/m$3;->b:Landroid/view/View;

    invoke-virtual {p1, v0}, Landroid/view/ViewGroup;->indexOfChild(Landroid/view/View;)I

    move-result p1

    if-gez p1, :cond_0

    iget-object v0, p0, Landroid/support/v4/app/m$3;->d:Landroid/support/v4/app/m;

    iget-object v1, p0, Landroid/support/v4/app/m$3;->c:Landroid/support/v4/app/g;

    iget-object p1, p0, Landroid/support/v4/app/m$3;->c:Landroid/support/v4/app/g;

    invoke-virtual {p1}, Landroid/support/v4/app/g;->V()I

    move-result v2

    const/4 v3, 0x0

    const/4 v4, 0x0

    const/4 v5, 0x0

    invoke-virtual/range {v0 .. v5}, Landroid/support/v4/app/m;->a(Landroid/support/v4/app/g;IIIZ)V

    :cond_0
    return-void
.end method
