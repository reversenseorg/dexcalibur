.class Landroid/support/v7/widget/d$c;
.super Ljava/lang/Object;

# interfaces
.implements Ljava/lang/Runnable;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/widget/d;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x2
    name = "c"
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/widget/d;

.field private b:Landroid/support/v7/widget/d$e;


# direct methods
.method public constructor <init>(Landroid/support/v7/widget/d;Landroid/support/v7/widget/d$e;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/d$c;->a:Landroid/support/v7/widget/d;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p2, p0, Landroid/support/v7/widget/d$c;->b:Landroid/support/v7/widget/d$e;

    return-void
.end method


# virtual methods
.method public run()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/d$c;->a:Landroid/support/v7/widget/d;

    invoke-static {v0}, Landroid/support/v7/widget/d;->d(Landroid/support/v7/widget/d;)Landroid/support/v7/view/menu/h;

    move-result-object v0

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/d$c;->a:Landroid/support/v7/widget/d;

    invoke-static {v0}, Landroid/support/v7/widget/d;->e(Landroid/support/v7/widget/d;)Landroid/support/v7/view/menu/h;

    move-result-object v0

    invoke-virtual {v0}, Landroid/support/v7/view/menu/h;->f()V

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/d$c;->a:Landroid/support/v7/widget/d;

    invoke-static {v0}, Landroid/support/v7/widget/d;->f(Landroid/support/v7/widget/d;)Landroid/support/v7/view/menu/p;

    move-result-object v0

    check-cast v0, Landroid/view/View;

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Landroid/view/View;->getWindowToken()Landroid/os/IBinder;

    move-result-object v0

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/widget/d$c;->b:Landroid/support/v7/widget/d$e;

    invoke-virtual {v0}, Landroid/support/v7/widget/d$e;->c()Z

    move-result v0

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/widget/d$c;->a:Landroid/support/v7/widget/d;

    iget-object v1, p0, Landroid/support/v7/widget/d$c;->b:Landroid/support/v7/widget/d$e;

    iput-object v1, v0, Landroid/support/v7/widget/d;->h:Landroid/support/v7/widget/d$e;

    :cond_1
    iget-object v0, p0, Landroid/support/v7/widget/d$c;->a:Landroid/support/v7/widget/d;

    const/4 v1, 0x0

    iput-object v1, v0, Landroid/support/v7/widget/d;->j:Landroid/support/v7/widget/d$c;

    return-void
.end method
