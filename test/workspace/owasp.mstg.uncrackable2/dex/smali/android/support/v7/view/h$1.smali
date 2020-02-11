.class Landroid/support/v7/view/h$1;
.super Landroid/support/v4/g/u;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/view/h;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/view/h;

.field private b:Z

.field private c:I


# direct methods
.method constructor <init>(Landroid/support/v7/view/h;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    invoke-direct {p0}, Landroid/support/v4/g/u;-><init>()V

    const/4 p1, 0x0

    iput-boolean p1, p0, Landroid/support/v7/view/h$1;->b:Z

    iput p1, p0, Landroid/support/v7/view/h$1;->c:I

    return-void
.end method


# virtual methods
.method a()V
    .locals 1

    const/4 v0, 0x0

    iput v0, p0, Landroid/support/v7/view/h$1;->c:I

    iput-boolean v0, p0, Landroid/support/v7/view/h$1;->b:Z

    iget-object v0, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    invoke-virtual {v0}, Landroid/support/v7/view/h;->b()V

    return-void
.end method

.method public a(Landroid/view/View;)V
    .locals 1

    iget-boolean p1, p0, Landroid/support/v7/view/h$1;->b:Z

    if-eqz p1, :cond_0

    return-void

    :cond_0
    const/4 p1, 0x1

    iput-boolean p1, p0, Landroid/support/v7/view/h$1;->b:Z

    iget-object p1, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    iget-object p1, p1, Landroid/support/v7/view/h;->b:Landroid/support/v4/g/t;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    iget-object p1, p1, Landroid/support/v7/view/h;->b:Landroid/support/v4/g/t;

    const/4 v0, 0x0

    invoke-interface {p1, v0}, Landroid/support/v4/g/t;->a(Landroid/view/View;)V

    :cond_1
    return-void
.end method

.method public b(Landroid/view/View;)V
    .locals 1

    iget p1, p0, Landroid/support/v7/view/h$1;->c:I

    add-int/lit8 p1, p1, 0x1

    iput p1, p0, Landroid/support/v7/view/h$1;->c:I

    iget-object v0, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    iget-object v0, v0, Landroid/support/v7/view/h;->a:Ljava/util/ArrayList;

    invoke-virtual {v0}, Ljava/util/ArrayList;->size()I

    move-result v0

    if-ne p1, v0, :cond_1

    iget-object p1, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    iget-object p1, p1, Landroid/support/v7/view/h;->b:Landroid/support/v4/g/t;

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/view/h$1;->a:Landroid/support/v7/view/h;

    iget-object p1, p1, Landroid/support/v7/view/h;->b:Landroid/support/v4/g/t;

    const/4 v0, 0x0

    invoke-interface {p1, v0}, Landroid/support/v4/g/t;->b(Landroid/view/View;)V

    :cond_0
    invoke-virtual {p0}, Landroid/support/v7/view/h$1;->a()V

    :cond_1
    return-void
.end method
