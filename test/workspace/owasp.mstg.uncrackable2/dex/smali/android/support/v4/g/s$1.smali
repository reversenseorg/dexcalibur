.class Landroid/support/v4/g/s$1;
.super Landroid/animation/AnimatorListenerAdapter;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Landroid/support/v4/g/s;->a(Landroid/view/View;Landroid/support/v4/g/t;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v4/g/t;

.field final synthetic b:Landroid/view/View;

.field final synthetic c:Landroid/support/v4/g/s;


# direct methods
.method constructor <init>(Landroid/support/v4/g/s;Landroid/support/v4/g/t;Landroid/view/View;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v4/g/s$1;->c:Landroid/support/v4/g/s;

    iput-object p2, p0, Landroid/support/v4/g/s$1;->a:Landroid/support/v4/g/t;

    iput-object p3, p0, Landroid/support/v4/g/s$1;->b:Landroid/view/View;

    invoke-direct {p0}, Landroid/animation/AnimatorListenerAdapter;-><init>()V

    return-void
.end method


# virtual methods
.method public onAnimationCancel(Landroid/animation/Animator;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v4/g/s$1;->a:Landroid/support/v4/g/t;

    iget-object v0, p0, Landroid/support/v4/g/s$1;->b:Landroid/view/View;

    invoke-interface {p1, v0}, Landroid/support/v4/g/t;->c(Landroid/view/View;)V

    return-void
.end method

.method public onAnimationEnd(Landroid/animation/Animator;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v4/g/s$1;->a:Landroid/support/v4/g/t;

    iget-object v0, p0, Landroid/support/v4/g/s$1;->b:Landroid/view/View;

    invoke-interface {p1, v0}, Landroid/support/v4/g/t;->b(Landroid/view/View;)V

    return-void
.end method

.method public onAnimationStart(Landroid/animation/Animator;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v4/g/s$1;->a:Landroid/support/v4/g/t;

    iget-object v0, p0, Landroid/support/v4/g/s$1;->b:Landroid/view/View;

    invoke-interface {p1, v0}, Landroid/support/v4/g/t;->a(Landroid/view/View;)V

    return-void
.end method
