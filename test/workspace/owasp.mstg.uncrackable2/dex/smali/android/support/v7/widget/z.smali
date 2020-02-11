.class Landroid/support/v7/widget/z;
.super Ljava/lang/Object;


# instance fields
.field final a:Landroid/widget/TextView;

.field private b:Landroid/support/v7/widget/au;

.field private c:Landroid/support/v7/widget/au;

.field private d:Landroid/support/v7/widget/au;

.field private e:Landroid/support/v7/widget/au;

.field private final f:Landroid/support/v7/widget/ac;

.field private g:I

.field private h:Landroid/graphics/Typeface;

.field private i:Z


# direct methods
.method constructor <init>(Landroid/widget/TextView;)V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput v0, p0, Landroid/support/v7/widget/z;->g:I

    iput-object p1, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    new-instance p1, Landroid/support/v7/widget/ac;

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-direct {p1, v0}, Landroid/support/v7/widget/ac;-><init>(Landroid/widget/TextView;)V

    iput-object p1, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    return-void
.end method

.method protected static a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;
    .locals 0

    invoke-virtual {p1, p0, p2}, Landroid/support/v7/widget/l;->b(Landroid/content/Context;I)Landroid/content/res/ColorStateList;

    move-result-object p0

    if-eqz p0, :cond_0

    new-instance p1, Landroid/support/v7/widget/au;

    invoke-direct {p1}, Landroid/support/v7/widget/au;-><init>()V

    const/4 p2, 0x1

    iput-boolean p2, p1, Landroid/support/v7/widget/au;->d:Z

    iput-object p0, p1, Landroid/support/v7/widget/au;->a:Landroid/content/res/ColorStateList;

    return-object p1

    :cond_0
    const/4 p0, 0x0

    return-object p0
.end method

.method static a(Landroid/widget/TextView;)Landroid/support/v7/widget/z;
    .locals 2

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x11

    if-lt v0, v1, :cond_0

    new-instance v0, Landroid/support/v7/widget/aa;

    invoke-direct {v0, p0}, Landroid/support/v7/widget/aa;-><init>(Landroid/widget/TextView;)V

    return-object v0

    :cond_0
    new-instance v0, Landroid/support/v7/widget/z;

    invoke-direct {v0, p0}, Landroid/support/v7/widget/z;-><init>(Landroid/widget/TextView;)V

    return-object v0
.end method

.method private a(Landroid/content/Context;Landroid/support/v7/widget/aw;)V
    .locals 4

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_android_textStyle:I

    iget v1, p0, Landroid/support/v7/widget/z;->g:I

    invoke-virtual {p2, v0, v1}, Landroid/support/v7/widget/aw;->a(II)I

    move-result v0

    iput v0, p0, Landroid/support/v7/widget/z;->g:I

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_android_fontFamily:I

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v0

    const/4 v1, 0x1

    const/4 v2, 0x0

    if-nez v0, :cond_2

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_fontFamily:I

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget p1, Landroid/support/v7/a/a$j;->TextAppearance_android_typeface:I

    invoke-virtual {p2, p1}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result p1

    if-eqz p1, :cond_1

    iput-boolean v2, p0, Landroid/support/v7/widget/z;->i:Z

    sget p1, Landroid/support/v7/a/a$j;->TextAppearance_android_typeface:I

    invoke-virtual {p2, p1, v1}, Landroid/support/v7/widget/aw;->a(II)I

    move-result p1

    packed-switch p1, :pswitch_data_0

    goto :goto_1

    :pswitch_0
    sget-object p1, Landroid/graphics/Typeface;->MONOSPACE:Landroid/graphics/Typeface;

    goto :goto_0

    :pswitch_1
    sget-object p1, Landroid/graphics/Typeface;->SERIF:Landroid/graphics/Typeface;

    goto :goto_0

    :pswitch_2
    sget-object p1, Landroid/graphics/Typeface;->SANS_SERIF:Landroid/graphics/Typeface;

    :goto_0
    iput-object p1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    :cond_1
    :goto_1
    return-void

    :cond_2
    :goto_2
    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_fontFamily:I

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v0

    if-eqz v0, :cond_3

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_fontFamily:I

    goto :goto_3

    :cond_3
    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_android_fontFamily:I

    :goto_3
    invoke-virtual {p1}, Landroid/content/Context;->isRestricted()Z

    move-result p1

    if-nez p1, :cond_5

    new-instance p1, Ljava/lang/ref/WeakReference;

    iget-object v3, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-direct {p1, v3}, Ljava/lang/ref/WeakReference;-><init>(Ljava/lang/Object;)V

    new-instance v3, Landroid/support/v7/widget/z$1;

    invoke-direct {v3, p0, p1}, Landroid/support/v7/widget/z$1;-><init>(Landroid/support/v7/widget/z;Ljava/lang/ref/WeakReference;)V

    :try_start_0
    iget p1, p0, Landroid/support/v7/widget/z;->g:I

    invoke-virtual {p2, v0, p1, v3}, Landroid/support/v7/widget/aw;->a(IILandroid/support/v4/a/a/b$a;)Landroid/graphics/Typeface;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    iget-object p1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    if-nez p1, :cond_4

    goto :goto_4

    :cond_4
    const/4 v1, 0x0

    :goto_4
    iput-boolean v1, p0, Landroid/support/v7/widget/z;->i:Z
    :try_end_0
    .catch Ljava/lang/UnsupportedOperationException; {:try_start_0 .. :try_end_0} :catch_0
    .catch Landroid/content/res/Resources$NotFoundException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_5

    :catch_0
    nop

    :cond_5
    :goto_5
    iget-object p1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    if-nez p1, :cond_6

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->d(I)Ljava/lang/String;

    move-result-object p1

    if-eqz p1, :cond_6

    iget p2, p0, Landroid/support/v7/widget/z;->g:I

    invoke-static {p1, p2}, Landroid/graphics/Typeface;->create(Ljava/lang/String;I)Landroid/graphics/Typeface;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    :cond_6
    return-void

    nop

    :pswitch_data_0
    .packed-switch 0x1
        :pswitch_2
        :pswitch_1
        :pswitch_0
    .end packed-switch
.end method

.method static synthetic a(Landroid/support/v7/widget/z;Ljava/lang/ref/WeakReference;Landroid/graphics/Typeface;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Landroid/support/v7/widget/z;->a(Ljava/lang/ref/WeakReference;Landroid/graphics/Typeface;)V

    return-void
.end method

.method private a(Ljava/lang/ref/WeakReference;Landroid/graphics/Typeface;)V
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/ref/WeakReference<",
            "Landroid/widget/TextView;",
            ">;",
            "Landroid/graphics/Typeface;",
            ")V"
        }
    .end annotation

    iget-boolean v0, p0, Landroid/support/v7/widget/z;->i:Z

    if-eqz v0, :cond_0

    iput-object p2, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    invoke-virtual {p1}, Ljava/lang/ref/WeakReference;->get()Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Landroid/widget/TextView;

    if-eqz p1, :cond_0

    iget v0, p0, Landroid/support/v7/widget/z;->g:I

    invoke-virtual {p1, p2, v0}, Landroid/widget/TextView;->setTypeface(Landroid/graphics/Typeface;I)V

    :cond_0
    return-void
.end method

.method private b(IF)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0, p1, p2}, Landroid/support/v7/widget/ac;->a(IF)V

    return-void
.end method


# virtual methods
.method a()V
    .locals 3

    iget-object v0, p0, Landroid/support/v7/widget/z;->b:Landroid/support/v7/widget/au;

    if-nez v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/z;->c:Landroid/support/v7/widget/au;

    if-nez v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/z;->d:Landroid/support/v7/widget/au;

    if-nez v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/z;->e:Landroid/support/v7/widget/au;

    if-eqz v0, :cond_1

    :cond_0
    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0}, Landroid/widget/TextView;->getCompoundDrawables()[Landroid/graphics/drawable/Drawable;

    move-result-object v0

    const/4 v1, 0x0

    aget-object v1, v0, v1

    iget-object v2, p0, Landroid/support/v7/widget/z;->b:Landroid/support/v7/widget/au;

    invoke-virtual {p0, v1, v2}, Landroid/support/v7/widget/z;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V

    const/4 v1, 0x1

    aget-object v1, v0, v1

    iget-object v2, p0, Landroid/support/v7/widget/z;->c:Landroid/support/v7/widget/au;

    invoke-virtual {p0, v1, v2}, Landroid/support/v7/widget/z;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V

    const/4 v1, 0x2

    aget-object v1, v0, v1

    iget-object v2, p0, Landroid/support/v7/widget/z;->d:Landroid/support/v7/widget/au;

    invoke-virtual {p0, v1, v2}, Landroid/support/v7/widget/z;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V

    const/4 v1, 0x3

    aget-object v0, v0, v1

    iget-object v1, p0, Landroid/support/v7/widget/z;->e:Landroid/support/v7/widget/au;

    invoke-virtual {p0, v0, v1}, Landroid/support/v7/widget/z;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V

    :cond_1
    return-void
.end method

.method a(I)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0, p1}, Landroid/support/v7/widget/ac;->a(I)V

    return-void
.end method

.method a(IF)V
    .locals 1

    sget-boolean v0, Landroid/support/v4/widget/b;->a:Z

    if-nez v0, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/widget/z;->c()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-direct {p0, p1, p2}, Landroid/support/v7/widget/z;->b(IF)V

    :cond_0
    return-void
.end method

.method a(IIII)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0, p1, p2, p3, p4}, Landroid/support/v7/widget/ac;->a(IIII)V

    return-void
.end method

.method a(Landroid/content/Context;I)V
    .locals 2

    sget-object v0, Landroid/support/v7/a/a$j;->TextAppearance:[I

    invoke-static {p1, p2, v0}, Landroid/support/v7/widget/aw;->a(Landroid/content/Context;I[I)Landroid/support/v7/widget/aw;

    move-result-object p2

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_textAllCaps:I

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v0

    if-eqz v0, :cond_0

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_textAllCaps:I

    const/4 v1, 0x0

    invoke-virtual {p2, v0, v1}, Landroid/support/v7/widget/aw;->a(IZ)Z

    move-result v0

    invoke-virtual {p0, v0}, Landroid/support/v7/widget/z;->a(Z)V

    :cond_0
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x17

    if-ge v0, v1, :cond_1

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_android_textColor:I

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v0

    if-eqz v0, :cond_1

    sget v0, Landroid/support/v7/a/a$j;->TextAppearance_android_textColor:I

    invoke-virtual {p2, v0}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v0

    if-eqz v0, :cond_1

    iget-object v1, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v1, v0}, Landroid/widget/TextView;->setTextColor(Landroid/content/res/ColorStateList;)V

    :cond_1
    invoke-direct {p0, p1, p2}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/aw;)V

    invoke-virtual {p2}, Landroid/support/v7/widget/aw;->a()V

    iget-object p1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    if-eqz p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    iget-object p2, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    iget v0, p0, Landroid/support/v7/widget/z;->g:I

    invoke-virtual {p1, p2, v0}, Landroid/widget/TextView;->setTypeface(Landroid/graphics/Typeface;I)V

    :cond_2
    return-void
.end method

.method final a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;)V
    .locals 1

    if-eqz p1, :cond_0

    if-eqz p2, :cond_0

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0}, Landroid/widget/TextView;->getDrawableState()[I

    move-result-object v0

    invoke-static {p1, p2, v0}, Landroid/support/v7/widget/l;->a(Landroid/graphics/drawable/Drawable;Landroid/support/v7/widget/au;[I)V

    :cond_0
    return-void
.end method

.method a(Landroid/util/AttributeSet;I)V
    .locals 13
    .annotation build Landroid/annotation/SuppressLint;
        value = {
            "NewApi"
        }
    .end annotation

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0}, Landroid/widget/TextView;->getContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {}, Landroid/support/v7/widget/l;->a()Landroid/support/v7/widget/l;

    move-result-object v1

    sget-object v2, Landroid/support/v7/a/a$j;->AppCompatTextHelper:[I

    const/4 v3, 0x0

    invoke-static {v0, p1, v2, p2, v3}, Landroid/support/v7/widget/aw;->a(Landroid/content/Context;Landroid/util/AttributeSet;[III)Landroid/support/v7/widget/aw;

    move-result-object v2

    sget v4, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_textAppearance:I

    const/4 v5, -0x1

    invoke-virtual {v2, v4, v5}, Landroid/support/v7/widget/aw;->g(II)I

    move-result v4

    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableLeft:I

    invoke-virtual {v2, v6}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v6

    if-eqz v6, :cond_0

    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableLeft:I

    invoke-virtual {v2, v6, v3}, Landroid/support/v7/widget/aw;->g(II)I

    move-result v6

    invoke-static {v0, v1, v6}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;

    move-result-object v6

    iput-object v6, p0, Landroid/support/v7/widget/z;->b:Landroid/support/v7/widget/au;

    :cond_0
    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableTop:I

    invoke-virtual {v2, v6}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v6

    if-eqz v6, :cond_1

    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableTop:I

    invoke-virtual {v2, v6, v3}, Landroid/support/v7/widget/aw;->g(II)I

    move-result v6

    invoke-static {v0, v1, v6}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;

    move-result-object v6

    iput-object v6, p0, Landroid/support/v7/widget/z;->c:Landroid/support/v7/widget/au;

    :cond_1
    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableRight:I

    invoke-virtual {v2, v6}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v6

    if-eqz v6, :cond_2

    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableRight:I

    invoke-virtual {v2, v6, v3}, Landroid/support/v7/widget/aw;->g(II)I

    move-result v6

    invoke-static {v0, v1, v6}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;

    move-result-object v6

    iput-object v6, p0, Landroid/support/v7/widget/z;->d:Landroid/support/v7/widget/au;

    :cond_2
    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableBottom:I

    invoke-virtual {v2, v6}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v6

    if-eqz v6, :cond_3

    sget v6, Landroid/support/v7/a/a$j;->AppCompatTextHelper_android_drawableBottom:I

    invoke-virtual {v2, v6, v3}, Landroid/support/v7/widget/aw;->g(II)I

    move-result v6

    invoke-static {v0, v1, v6}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/l;I)Landroid/support/v7/widget/au;

    move-result-object v1

    iput-object v1, p0, Landroid/support/v7/widget/z;->e:Landroid/support/v7/widget/au;

    :cond_3
    invoke-virtual {v2}, Landroid/support/v7/widget/aw;->a()V

    iget-object v1, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v1}, Landroid/widget/TextView;->getTransformationMethod()Landroid/text/method/TransformationMethod;

    move-result-object v1

    instance-of v1, v1, Landroid/text/method/PasswordTransformationMethod;

    const/4 v2, 0x1

    const/16 v6, 0x17

    const/4 v7, 0x0

    if-eq v4, v5, :cond_9

    sget-object v5, Landroid/support/v7/a/a$j;->TextAppearance:[I

    invoke-static {v0, v4, v5}, Landroid/support/v7/widget/aw;->a(Landroid/content/Context;I[I)Landroid/support/v7/widget/aw;

    move-result-object v4

    if-nez v1, :cond_4

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_textAllCaps:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v5

    if-eqz v5, :cond_4

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_textAllCaps:I

    invoke-virtual {v4, v5, v3}, Landroid/support/v7/widget/aw;->a(IZ)Z

    move-result v5

    move v8, v5

    const/4 v5, 0x1

    goto :goto_0

    :cond_4
    const/4 v5, 0x0

    const/4 v8, 0x0

    :goto_0
    invoke-direct {p0, v0, v4}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/aw;)V

    sget v9, Landroid/os/Build$VERSION;->SDK_INT:I

    if-ge v9, v6, :cond_8

    sget v9, Landroid/support/v7/a/a$j;->TextAppearance_android_textColor:I

    invoke-virtual {v4, v9}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v9

    if-eqz v9, :cond_5

    sget v9, Landroid/support/v7/a/a$j;->TextAppearance_android_textColor:I

    invoke-virtual {v4, v9}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v9

    goto :goto_1

    :cond_5
    move-object v9, v7

    :goto_1
    sget v10, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorHint:I

    invoke-virtual {v4, v10}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v10

    if-eqz v10, :cond_6

    sget v10, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorHint:I

    invoke-virtual {v4, v10}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v10

    goto :goto_2

    :cond_6
    move-object v10, v7

    :goto_2
    sget v11, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorLink:I

    invoke-virtual {v4, v11}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v11

    if-eqz v11, :cond_7

    sget v7, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorLink:I

    invoke-virtual {v4, v7}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v7

    :cond_7
    move-object v12, v9

    move-object v9, v7

    move-object v7, v12

    goto :goto_3

    :cond_8
    move-object v9, v7

    move-object v10, v9

    :goto_3
    invoke-virtual {v4}, Landroid/support/v7/widget/aw;->a()V

    goto :goto_4

    :cond_9
    move-object v9, v7

    move-object v10, v9

    const/4 v5, 0x0

    const/4 v8, 0x0

    :goto_4
    sget-object v4, Landroid/support/v7/a/a$j;->TextAppearance:[I

    invoke-static {v0, p1, v4, p2, v3}, Landroid/support/v7/widget/aw;->a(Landroid/content/Context;Landroid/util/AttributeSet;[III)Landroid/support/v7/widget/aw;

    move-result-object v4

    if-nez v1, :cond_a

    sget v11, Landroid/support/v7/a/a$j;->TextAppearance_textAllCaps:I

    invoke-virtual {v4, v11}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v11

    if-eqz v11, :cond_a

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_textAllCaps:I

    invoke-virtual {v4, v5, v3}, Landroid/support/v7/widget/aw;->a(IZ)Z

    move-result v8

    goto :goto_5

    :cond_a
    move v2, v5

    :goto_5
    sget v5, Landroid/os/Build$VERSION;->SDK_INT:I

    if-ge v5, v6, :cond_d

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_android_textColor:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v5

    if-eqz v5, :cond_b

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_android_textColor:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v5

    move-object v7, v5

    :cond_b
    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorHint:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v5

    if-eqz v5, :cond_c

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorHint:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v5

    move-object v10, v5

    :cond_c
    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorLink:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->g(I)Z

    move-result v5

    if-eqz v5, :cond_d

    sget v5, Landroid/support/v7/a/a$j;->TextAppearance_android_textColorLink:I

    invoke-virtual {v4, v5}, Landroid/support/v7/widget/aw;->e(I)Landroid/content/res/ColorStateList;

    move-result-object v9

    :cond_d
    invoke-direct {p0, v0, v4}, Landroid/support/v7/widget/z;->a(Landroid/content/Context;Landroid/support/v7/widget/aw;)V

    invoke-virtual {v4}, Landroid/support/v7/widget/aw;->a()V

    if-eqz v7, :cond_e

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0, v7}, Landroid/widget/TextView;->setTextColor(Landroid/content/res/ColorStateList;)V

    :cond_e
    if-eqz v10, :cond_f

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0, v10}, Landroid/widget/TextView;->setHintTextColor(Landroid/content/res/ColorStateList;)V

    :cond_f
    if-eqz v9, :cond_10

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0, v9}, Landroid/widget/TextView;->setLinkTextColor(Landroid/content/res/ColorStateList;)V

    :cond_10
    if-nez v1, :cond_11

    if-eqz v2, :cond_11

    invoke-virtual {p0, v8}, Landroid/support/v7/widget/z;->a(Z)V

    :cond_11
    iget-object v0, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    if-eqz v0, :cond_12

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    iget-object v1, p0, Landroid/support/v7/widget/z;->h:Landroid/graphics/Typeface;

    iget v2, p0, Landroid/support/v7/widget/z;->g:I

    invoke-virtual {v0, v1, v2}, Landroid/widget/TextView;->setTypeface(Landroid/graphics/Typeface;I)V

    :cond_12
    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0, p1, p2}, Landroid/support/v7/widget/ac;->a(Landroid/util/AttributeSet;I)V

    sget-boolean p1, Landroid/support/v4/widget/b;->a:Z

    if-eqz p1, :cond_14

    iget-object p1, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {p1}, Landroid/support/v7/widget/ac;->a()I

    move-result p1

    if-eqz p1, :cond_14

    iget-object p1, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {p1}, Landroid/support/v7/widget/ac;->e()[I

    move-result-object p1

    array-length p2, p1

    if-lez p2, :cond_14

    iget-object p2, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {p2}, Landroid/widget/TextView;->getAutoSizeStepGranularity()I

    move-result p2

    int-to-float p2, p2

    const/high16 v0, -0x40800000    # -1.0f

    cmpl-float p2, p2, v0

    if-eqz p2, :cond_13

    iget-object p1, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    iget-object p2, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {p2}, Landroid/support/v7/widget/ac;->c()I

    move-result p2

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->d()I

    move-result v0

    iget-object v1, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v1}, Landroid/support/v7/widget/ac;->b()I

    move-result v1

    invoke-virtual {p1, p2, v0, v1, v3}, Landroid/widget/TextView;->setAutoSizeTextTypeUniformWithConfiguration(IIII)V

    goto :goto_6

    :cond_13
    iget-object p2, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {p2, p1, v3}, Landroid/widget/TextView;->setAutoSizeTextTypeUniformWithPresetSizes([II)V

    :cond_14
    :goto_6
    return-void
.end method

.method a(Z)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->a:Landroid/widget/TextView;

    invoke-virtual {v0, p1}, Landroid/widget/TextView;->setAllCaps(Z)V

    return-void
.end method

.method a(ZIIII)V
    .locals 0

    sget-boolean p1, Landroid/support/v4/widget/b;->a:Z

    if-nez p1, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/widget/z;->b()V

    :cond_0
    return-void
.end method

.method a([II)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0, p1, p2}, Landroid/support/v7/widget/ac;->a([II)V

    return-void
.end method

.method b()V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->f()V

    return-void
.end method

.method c()Z
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->g()Z

    move-result v0

    return v0
.end method

.method d()I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->a()I

    move-result v0

    return v0
.end method

.method e()I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->b()I

    move-result v0

    return v0
.end method

.method f()I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->c()I

    move-result v0

    return v0
.end method

.method g()I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->d()I

    move-result v0

    return v0
.end method

.method h()[I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/z;->f:Landroid/support/v7/widget/ac;

    invoke-virtual {v0}, Landroid/support/v7/widget/ac;->e()[I

    move-result-object v0

    return-object v0
.end method
