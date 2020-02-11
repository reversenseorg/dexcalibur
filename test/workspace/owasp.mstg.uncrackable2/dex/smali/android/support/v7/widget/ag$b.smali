.class Landroid/support/v7/widget/ag$b;
.super Ljava/lang/Object;

# interfaces
.implements Ljava/lang/Runnable;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/widget/ag;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x2
    name = "b"
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/widget/ag;


# direct methods
.method private constructor <init>(Landroid/support/v7/widget/ag;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/widget/ag$b;->a:Landroid/support/v7/widget/ag;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method synthetic constructor <init>(Landroid/support/v7/widget/ag;Landroid/support/v7/widget/ag$1;)V
    .locals 0

    invoke-direct {p0, p1}, Landroid/support/v7/widget/ag$b;-><init>(Landroid/support/v7/widget/ag;)V

    return-void
.end method


# virtual methods
.method public a()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/ag$b;->a:Landroid/support/v7/widget/ag;

    const/4 v1, 0x0

    invoke-static {v0, v1}, Landroid/support/v7/widget/ag;->a(Landroid/support/v7/widget/ag;Landroid/support/v7/widget/ag$b;)Landroid/support/v7/widget/ag$b;

    iget-object v0, p0, Landroid/support/v7/widget/ag$b;->a:Landroid/support/v7/widget/ag;

    invoke-virtual {v0, p0}, Landroid/support/v7/widget/ag;->removeCallbacks(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public b()V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/ag$b;->a:Landroid/support/v7/widget/ag;

    invoke-virtual {v0, p0}, Landroid/support/v7/widget/ag;->post(Ljava/lang/Runnable;)Z

    return-void
.end method

.method public run()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/ag$b;->a:Landroid/support/v7/widget/ag;

    const/4 v1, 0x0

    invoke-static {v0, v1}, Landroid/support/v7/widget/ag;->a(Landroid/support/v7/widget/ag;Landroid/support/v7/widget/ag$b;)Landroid/support/v7/widget/ag$b;

    iget-object v0, p0, Landroid/support/v7/widget/ag$b;->a:Landroid/support/v7/widget/ag;

    invoke-virtual {v0}, Landroid/support/v7/widget/ag;->drawableStateChanged()V

    return-void
.end method
