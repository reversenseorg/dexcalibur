.class public abstract Landroid/support/v4/b/a/d$a;
.super Landroid/graphics/drawable/Drawable$ConstantState;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v4/b/a/d;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x40c
    name = "a"
.end annotation


# instance fields
.field a:I

.field b:Landroid/graphics/drawable/Drawable$ConstantState;

.field c:Landroid/content/res/ColorStateList;

.field d:Landroid/graphics/PorterDuff$Mode;


# direct methods
.method constructor <init>(Landroid/support/v4/b/a/d$a;Landroid/content/res/Resources;)V
    .locals 0

    invoke-direct {p0}, Landroid/graphics/drawable/Drawable$ConstantState;-><init>()V

    const/4 p2, 0x0

    iput-object p2, p0, Landroid/support/v4/b/a/d$a;->c:Landroid/content/res/ColorStateList;

    sget-object p2, Landroid/support/v4/b/a/d;->a:Landroid/graphics/PorterDuff$Mode;

    iput-object p2, p0, Landroid/support/v4/b/a/d$a;->d:Landroid/graphics/PorterDuff$Mode;

    if-eqz p1, :cond_0

    iget p2, p1, Landroid/support/v4/b/a/d$a;->a:I

    iput p2, p0, Landroid/support/v4/b/a/d$a;->a:I

    iget-object p2, p1, Landroid/support/v4/b/a/d$a;->b:Landroid/graphics/drawable/Drawable$ConstantState;

    iput-object p2, p0, Landroid/support/v4/b/a/d$a;->b:Landroid/graphics/drawable/Drawable$ConstantState;

    iget-object p2, p1, Landroid/support/v4/b/a/d$a;->c:Landroid/content/res/ColorStateList;

    iput-object p2, p0, Landroid/support/v4/b/a/d$a;->c:Landroid/content/res/ColorStateList;

    iget-object p1, p1, Landroid/support/v4/b/a/d$a;->d:Landroid/graphics/PorterDuff$Mode;

    iput-object p1, p0, Landroid/support/v4/b/a/d$a;->d:Landroid/graphics/PorterDuff$Mode;

    :cond_0
    return-void
.end method


# virtual methods
.method a()Z
    .locals 1

    iget-object v0, p0, Landroid/support/v4/b/a/d$a;->b:Landroid/graphics/drawable/Drawable$ConstantState;

    if-eqz v0, :cond_0

    const/4 v0, 0x1

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    return v0
.end method

.method public getChangingConfigurations()I
    .locals 2

    iget v0, p0, Landroid/support/v4/b/a/d$a;->a:I

    iget-object v1, p0, Landroid/support/v4/b/a/d$a;->b:Landroid/graphics/drawable/Drawable$ConstantState;

    if-eqz v1, :cond_0

    iget-object v1, p0, Landroid/support/v4/b/a/d$a;->b:Landroid/graphics/drawable/Drawable$ConstantState;

    invoke-virtual {v1}, Landroid/graphics/drawable/Drawable$ConstantState;->getChangingConfigurations()I

    move-result v1

    goto :goto_0

    :cond_0
    const/4 v1, 0x0

    :goto_0
    or-int/2addr v0, v1

    return v0
.end method

.method public newDrawable()Landroid/graphics/drawable/Drawable;
    .locals 1

    const/4 v0, 0x0

    invoke-virtual {p0, v0}, Landroid/support/v4/b/a/d$a;->newDrawable(Landroid/content/res/Resources;)Landroid/graphics/drawable/Drawable;

    move-result-object v0

    return-object v0
.end method

.method public abstract newDrawable(Landroid/content/res/Resources;)Landroid/graphics/drawable/Drawable;
.end method
