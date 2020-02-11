.class Landroid/support/v7/view/menu/e$3$1;
.super Ljava/lang/Object;

# interfaces
.implements Ljava/lang/Runnable;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Landroid/support/v7/view/menu/e$3;->b(Landroid/support/v7/view/menu/h;Landroid/view/MenuItem;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/view/menu/e$a;

.field final synthetic b:Landroid/view/MenuItem;

.field final synthetic c:Landroid/support/v7/view/menu/h;

.field final synthetic d:Landroid/support/v7/view/menu/e$3;


# direct methods
.method constructor <init>(Landroid/support/v7/view/menu/e$3;Landroid/support/v7/view/menu/e$a;Landroid/view/MenuItem;Landroid/support/v7/view/menu/h;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/view/menu/e$3$1;->d:Landroid/support/v7/view/menu/e$3;

    iput-object p2, p0, Landroid/support/v7/view/menu/e$3$1;->a:Landroid/support/v7/view/menu/e$a;

    iput-object p3, p0, Landroid/support/v7/view/menu/e$3$1;->b:Landroid/view/MenuItem;

    iput-object p4, p0, Landroid/support/v7/view/menu/e$3$1;->c:Landroid/support/v7/view/menu/h;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public run()V
    .locals 3

    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->a:Landroid/support/v7/view/menu/e$a;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->d:Landroid/support/v7/view/menu/e$3;

    iget-object v0, v0, Landroid/support/v7/view/menu/e$3;->a:Landroid/support/v7/view/menu/e;

    const/4 v1, 0x1

    iput-boolean v1, v0, Landroid/support/v7/view/menu/e;->d:Z

    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->a:Landroid/support/v7/view/menu/e$a;

    iget-object v0, v0, Landroid/support/v7/view/menu/e$a;->b:Landroid/support/v7/view/menu/h;

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/support/v7/view/menu/h;->a(Z)V

    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->d:Landroid/support/v7/view/menu/e$3;

    iget-object v0, v0, Landroid/support/v7/view/menu/e$3;->a:Landroid/support/v7/view/menu/e;

    iput-boolean v1, v0, Landroid/support/v7/view/menu/e;->d:Z

    :cond_0
    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->b:Landroid/view/MenuItem;

    invoke-interface {v0}, Landroid/view/MenuItem;->isEnabled()Z

    move-result v0

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->b:Landroid/view/MenuItem;

    invoke-interface {v0}, Landroid/view/MenuItem;->hasSubMenu()Z

    move-result v0

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/view/menu/e$3$1;->c:Landroid/support/v7/view/menu/h;

    iget-object v1, p0, Landroid/support/v7/view/menu/e$3$1;->b:Landroid/view/MenuItem;

    const/4 v2, 0x4

    invoke-virtual {v0, v1, v2}, Landroid/support/v7/view/menu/h;->a(Landroid/view/MenuItem;I)Z

    :cond_1
    return-void
.end method
