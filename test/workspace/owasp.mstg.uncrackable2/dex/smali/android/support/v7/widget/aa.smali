.class Landroid/support/v7/widget/aa;
.super Landroid/support/v7/widget/z;


# instance fields
.field private b:Landroid/support/v7/widget/au;

.field private c:Landroid/support/v7/widget/au;


# direct methods
.method constructor <init>(Landroid/widget/TextView;)V
    .locals 0

    invoke-direct {p0, p1}, Landroid/support/v7/widget/z;-><init>(Landroid/widget/TextView;)V

    return-void
.end method


# virtual methods
.method a()V
    .locals 3

    invoke-super {p0}, Landroid/support/v7/widget/z;->a()V

    iget-object v0, p0, Landroid/support/v7/widget/aa;->b:Landroid/support/v7/widget/au;

    if-nez v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/aa;->c:Landroid/support/v7/widget/au;

    if-eqz v0, :cond_1

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/aa;->a:Landroid/widget/TextView;

    invoke-virtual {v0}, Landroid/widget/TextView;->getCompoundDrawablesRelative()[Landroid/graphics/drawable/Drawable;

    move-result-object v0

    const/4 v1, 0x0

    aget-object v1, v0, v1

    iget-object v2, p0, Landroid/support/v7/widget/aa;->b:Landroid/support/v7/widget/au;

    invoke-virtual {p0, v1, v2}, Landroid/support/v7/widget/aa;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V

    const/4 v1, 0x2

    aget-object v0, v0, v1

    iget-object v1, p0, Landroid/support/v7/widget/aa;->c:Landroid/support/v7/widget/au;

    invoke-virtual {p0, v0, v1}, Landroid/support/v7/widget/aa;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V

    :cond_1
    return-void
.end method

.method a(Landroid/util/AttributeSet;I)V
    .locals 4

    invoke-super {p0, p1, p2}, Landroid/support/v7/widget/z;->a(Landroid/util/AttributeSet;I)V

    iget-object v0, p0, Landroid/support/v7/widget/aa;->a:Landroid/widget/TextView;

    invoke-virtual {v0}, Landroid/widget/TextView;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {}, Landroid/support/v7/widget/l;->a()Landroid/support/v7/widget/l;

    move-result-object v1

    sget-object v2, Landroid/support/v7/a/a$j;->AppCompatTextHelper:[I

    const/4 v3, 0x0

    invoke-virtual {v0, p1, v2, p2, v3}, Landroid/content/Context;->obtainStyledAttributes(Landroid/util/AttributeSet;[III)Landroid/content/res/TypedArray;

    move-result-object p1

    sget p2, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableStart:I

    invoke-virtual {p1, p2}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result p2

    if-eqz p2, :cond_0

    sget p2, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableStart:I

    invoke-virtual {p1, p2, v3}, Landroid/content/res/TypedArray;->getResourceId(II)I

    move-result p2

    invoke-static {v0, v1, p2}, Landroid/support/v7/widget/aa;->a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;

    move-result-object p2

    iput-object p2, p0, Landroid/support/v7/widget/aa;->b:Landroid/support/v7/widget/au;

    :cond_0
    sget p2, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableEnd:I

    invoke-virtual {p1, p2}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result p2

    if-eqz p2, :cond_1

    sget p2, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableEnd:I

    invoke-virtual {p1, p2, v3}, Landroid/content/res/TypedArray;->getResourceId(II)I

    move-result p2

    invoke-static {v0, v1, p2}, Landroid/support/v7/widget/aa;->a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;

    move-result-object p2

    iput-object p2, p0, Landroid/support/v7/widget/aa;->c:Landroid/support/v7/widget/au;

    :cond_1
    invoke-virtual {p1}, Landroid/content/res/TypedArray;->recycle()V

    return-void
.end method
