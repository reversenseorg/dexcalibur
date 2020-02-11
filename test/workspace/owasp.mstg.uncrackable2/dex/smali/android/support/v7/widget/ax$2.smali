.class Landroid/support/v7/widget/ax$2;
.super Landroid/support/v4/g/u;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Landroid/support/v7/widget/ax;->a(IJ)Landroid/support/v4/g/s;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:I

.field final synthetic b:Landroid/support/v7/widget/ax;

.field private c:Z


# direct methods
.method constructor <init>(Landroid/support/v7/widget/ax;I)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/ax$2;->b:Landroid/support/v7/widget/ax;

    iput p2, p0, Landroid/support/v7/widget/ax$2;->a:I

    invoke-direct {p0}, Landroid/support/v4/g/u;-><init>()V

    const/4 p1, 0x0

    iput-boolean p1, p0, Landroid/support/v7/widget/ax$2;->c:Z

    return-void
.end method


# virtual methods
.method public a(Landroid/view/View;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v7/widget/ax$2;->b:Landroid/support/v7/widget/ax;

    iget-object p1, p1, Landroid/support/v7/widget/ax;->a:Landroid/support/v7/widget/Toolbar;

    const/4 v0, 0x0

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/Toolbar;->setVisibility(I)V

    return-void
.end method

.method public b(Landroid/view/View;)V
    .locals 1

    iget-boolean p1, p0, Landroid/support/v7/widget/ax$2;->c:Z

    if-nez p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/widget/ax$2;->b:Landroid/support/v7/widget/ax;

    iget-object p1, p1, Landroid/support/v7/widget/ax;->a:Landroid/support/v7/widget/Toolbar;

    iget v0, p0, Landroid/support/v7/widget/ax$2;->a:I

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/Toolbar;->setVisibility(I)V

    :cond_0
    return-void
.end method

.method public c(Landroid/view/View;)V
    .locals 0

    const/4 p1, 0x1

    iput-boolean p1, p0, Landroid/support/v7/widget/ax$2;->c:Z

    return-void
.end method
