.class Landroid/support/b/a/i$c;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/b/a/i;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0xa
    name = "c"
.end annotation


# instance fields
.field final a:Ljava/util/ArrayList;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Ljava/util/ArrayList<",
            "Ljava/lang/Object;",
            ">;"
        }
    .end annotation
.end field

.field b:F

.field c:I

.field private final d:Landroid/graphics/Matrix;

.field private e:F

.field private f:F

.field private g:F

.field private h:F

.field private i:F

.field private j:F

.field private final k:Landroid/graphics/Matrix;

.field private l:[I

.field private m:Ljava/lang/String;


# direct methods
.method public constructor <init>()V
    .locals 2

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Landroid/graphics/Matrix;

    invoke-direct {v0}, Landroid/graphics/Matrix;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$c;->d:Landroid/graphics/Matrix;

    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$c;->a:Ljava/util/ArrayList;

    const/4 v0, 0x0

    iput v0, p0, Landroid/support/b/a/i$c;->b:F

    iput v0, p0, Landroid/support/b/a/i$c;->e:F

    iput v0, p0, Landroid/support/b/a/i$c;->f:F

    const/high16 v1, 0x3f800000    # 1.0f

    iput v1, p0, Landroid/support/b/a/i$c;->g:F

    iput v1, p0, Landroid/support/b/a/i$c;->h:F

    iput v0, p0, Landroid/support/b/a/i$c;->i:F

    iput v0, p0, Landroid/support/b/a/i$c;->j:F

    new-instance v0, Landroid/graphics/Matrix;

    invoke-direct {v0}, Landroid/graphics/Matrix;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    return-void
.end method

.method public constructor <init>(Landroid/support/b/a/i$c;Landroid/support/v4/f/a;)V
    .locals 4
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/support/b/a/i$c;",
            "Landroid/support/v4/f/a<",
            "Ljava/lang/String;",
            "Ljava/lang/Object;",
            ">;)V"
        }
    .end annotation

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Landroid/graphics/Matrix;

    invoke-direct {v0}, Landroid/graphics/Matrix;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$c;->d:Landroid/graphics/Matrix;

    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$c;->a:Ljava/util/ArrayList;

    const/4 v0, 0x0

    iput v0, p0, Landroid/support/b/a/i$c;->b:F

    iput v0, p0, Landroid/support/b/a/i$c;->e:F

    iput v0, p0, Landroid/support/b/a/i$c;->f:F

    const/high16 v1, 0x3f800000    # 1.0f

    iput v1, p0, Landroid/support/b/a/i$c;->g:F

    iput v1, p0, Landroid/support/b/a/i$c;->h:F

    iput v0, p0, Landroid/support/b/a/i$c;->i:F

    iput v0, p0, Landroid/support/b/a/i$c;->j:F

    new-instance v0, Landroid/graphics/Matrix;

    invoke-direct {v0}, Landroid/graphics/Matrix;-><init>()V

    iput-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    iget v0, p1, Landroid/support/b/a/i$c;->b:F

    iput v0, p0, Landroid/support/b/a/i$c;->b:F

    iget v0, p1, Landroid/support/b/a/i$c;->e:F

    iput v0, p0, Landroid/support/b/a/i$c;->e:F

    iget v0, p1, Landroid/support/b/a/i$c;->f:F

    iput v0, p0, Landroid/support/b/a/i$c;->f:F

    iget v0, p1, Landroid/support/b/a/i$c;->g:F

    iput v0, p0, Landroid/support/b/a/i$c;->g:F

    iget v0, p1, Landroid/support/b/a/i$c;->h:F

    iput v0, p0, Landroid/support/b/a/i$c;->h:F

    iget v0, p1, Landroid/support/b/a/i$c;->i:F

    iput v0, p0, Landroid/support/b/a/i$c;->i:F

    iget v0, p1, Landroid/support/b/a/i$c;->j:F

    iput v0, p0, Landroid/support/b/a/i$c;->j:F

    iget-object v0, p1, Landroid/support/b/a/i$c;->l:[I

    iput-object v0, p0, Landroid/support/b/a/i$c;->l:[I

    iget-object v0, p1, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    iput-object v0, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    iget v0, p1, Landroid/support/b/a/i$c;->c:I

    iput v0, p0, Landroid/support/b/a/i$c;->c:I

    iget-object v0, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    invoke-virtual {p2, v0, p0}, Landroid/support/v4/f/a;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    :cond_0
    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    iget-object v1, p1, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    invoke-virtual {v0, v1}, Landroid/graphics/Matrix;->set(Landroid/graphics/Matrix;)V

    iget-object p1, p1, Landroid/support/b/a/i$c;->a:Ljava/util/ArrayList;

    const/4 v0, 0x0

    :goto_0
    invoke-virtual {p1}, Ljava/util/ArrayList;->size()I

    move-result v1

    if-ge v0, v1, :cond_5

    invoke-virtual {p1, v0}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object v1

    instance-of v2, v1, Landroid/support/b/a/i$c;

    if-eqz v2, :cond_1

    check-cast v1, Landroid/support/b/a/i$c;

    iget-object v2, p0, Landroid/support/b/a/i$c;->a:Ljava/util/ArrayList;

    new-instance v3, Landroid/support/b/a/i$c;

    invoke-direct {v3, v1, p2}, Landroid/support/b/a/i$c;-><init>(Landroid/support/b/a/i$c;Landroid/support/v4/f/a;)V

    invoke-virtual {v2, v3}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    goto :goto_2

    :cond_1
    instance-of v2, v1, Landroid/support/b/a/i$b;

    if-eqz v2, :cond_2

    new-instance v2, Landroid/support/b/a/i$b;

    check-cast v1, Landroid/support/b/a/i$b;

    invoke-direct {v2, v1}, Landroid/support/b/a/i$b;-><init>(Landroid/support/b/a/i$b;)V

    goto :goto_1

    :cond_2
    instance-of v2, v1, Landroid/support/b/a/i$a;

    if-eqz v2, :cond_4

    new-instance v2, Landroid/support/b/a/i$a;

    check-cast v1, Landroid/support/b/a/i$a;

    invoke-direct {v2, v1}, Landroid/support/b/a/i$a;-><init>(Landroid/support/b/a/i$a;)V

    :goto_1
    iget-object v1, p0, Landroid/support/b/a/i$c;->a:Ljava/util/ArrayList;

    invoke-virtual {v1, v2}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    iget-object v1, v2, Landroid/support/b/a/i$d;->n:Ljava/lang/String;

    if-eqz v1, :cond_3

    iget-object v1, v2, Landroid/support/b/a/i$d;->n:Ljava/lang/String;

    invoke-virtual {p2, v1, v2}, Landroid/support/v4/f/a;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    :cond_3
    :goto_2
    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_4
    new-instance p1, Ljava/lang/IllegalStateException;

    const-string p2, "Unknown object in the tree!"

    invoke-direct {p1, p2}, Ljava/lang/IllegalStateException;-><init>(Ljava/lang/String;)V

    throw p1

    :cond_5
    return-void
.end method

.method static synthetic a(Landroid/support/b/a/i$c;)Landroid/graphics/Matrix;
    .locals 0

    iget-object p0, p0, Landroid/support/b/a/i$c;->d:Landroid/graphics/Matrix;

    return-object p0
.end method

.method private a()V
    .locals 4

    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    invoke-virtual {v0}, Landroid/graphics/Matrix;->reset()V

    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    iget v1, p0, Landroid/support/b/a/i$c;->e:F

    neg-float v1, v1

    iget v2, p0, Landroid/support/b/a/i$c;->f:F

    neg-float v2, v2

    invoke-virtual {v0, v1, v2}, Landroid/graphics/Matrix;->postTranslate(FF)Z

    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    iget v1, p0, Landroid/support/b/a/i$c;->g:F

    iget v2, p0, Landroid/support/b/a/i$c;->h:F

    invoke-virtual {v0, v1, v2}, Landroid/graphics/Matrix;->postScale(FF)Z

    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    iget v1, p0, Landroid/support/b/a/i$c;->b:F

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2, v2}, Landroid/graphics/Matrix;->postRotate(FFF)Z

    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    iget v1, p0, Landroid/support/b/a/i$c;->i:F

    iget v2, p0, Landroid/support/b/a/i$c;->e:F

    add-float/2addr v1, v2

    iget v2, p0, Landroid/support/b/a/i$c;->j:F

    iget v3, p0, Landroid/support/b/a/i$c;->f:F

    add-float/2addr v2, v3

    invoke-virtual {v0, v1, v2}, Landroid/graphics/Matrix;->postTranslate(FF)Z

    return-void
.end method

.method private a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;)V
    .locals 3

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$c;->l:[I

    const-string v0, "rotation"

    iget v1, p0, Landroid/support/b/a/i$c;->b:F

    const/4 v2, 0x5

    invoke-static {p1, p2, v0, v2, v1}, Landroid/support/v4/a/a/c;->a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;Ljava/lang/String;IF)F

    move-result v0

    iput v0, p0, Landroid/support/b/a/i$c;->b:F

    iget v0, p0, Landroid/support/b/a/i$c;->e:F

    const/4 v1, 0x1

    invoke-virtual {p1, v1, v0}, Landroid/content/res/TypedArray;->getFloat(IF)F

    move-result v0

    iput v0, p0, Landroid/support/b/a/i$c;->e:F

    iget v0, p0, Landroid/support/b/a/i$c;->f:F

    const/4 v1, 0x2

    invoke-virtual {p1, v1, v0}, Landroid/content/res/TypedArray;->getFloat(IF)F

    move-result v0

    iput v0, p0, Landroid/support/b/a/i$c;->f:F

    const-string v0, "scaleX"

    iget v1, p0, Landroid/support/b/a/i$c;->g:F

    const/4 v2, 0x3

    invoke-static {p1, p2, v0, v2, v1}, Landroid/support/v4/a/a/c;->a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;Ljava/lang/String;IF)F

    move-result v0

    iput v0, p0, Landroid/support/b/a/i$c;->g:F

    const-string v0, "scaleY"

    iget v1, p0, Landroid/support/b/a/i$c;->h:F

    const/4 v2, 0x4

    invoke-static {p1, p2, v0, v2, v1}, Landroid/support/v4/a/a/c;->a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;Ljava/lang/String;IF)F

    move-result v0

    iput v0, p0, Landroid/support/b/a/i$c;->h:F

    const-string v0, "translateX"

    iget v1, p0, Landroid/support/b/a/i$c;->i:F

    const/4 v2, 0x6

    invoke-static {p1, p2, v0, v2, v1}, Landroid/support/v4/a/a/c;->a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;Ljava/lang/String;IF)F

    move-result v0

    iput v0, p0, Landroid/support/b/a/i$c;->i:F

    const-string v0, "translateY"

    iget v1, p0, Landroid/support/b/a/i$c;->j:F

    const/4 v2, 0x7

    invoke-static {p1, p2, v0, v2, v1}, Landroid/support/v4/a/a/c;->a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;Ljava/lang/String;IF)F

    move-result p2

    iput p2, p0, Landroid/support/b/a/i$c;->j:F

    const/4 p2, 0x0

    invoke-virtual {p1, p2}, Landroid/content/res/TypedArray;->getString(I)Ljava/lang/String;

    move-result-object p1

    if-eqz p1, :cond_0

    iput-object p1, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    :cond_0
    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    return-void
.end method

.method static synthetic b(Landroid/support/b/a/i$c;)Landroid/graphics/Matrix;
    .locals 0

    iget-object p0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    return-object p0
.end method


# virtual methods
.method public a(Landroid/content/res/Resources;Landroid/util/AttributeSet;Landroid/content/res/Resources$Theme;Lorg/xmlpull/v1/XmlPullParser;)V
    .locals 1

    sget-object v0, Landroid/support/b/a/a;->b:[I

    invoke-static {p1, p3, p2, v0}, Landroid/support/v4/a/a/c;->a(Landroid/content/res/Resources;Landroid/content/res/Resources$Theme;Landroid/util/AttributeSet;[I)Landroid/content/res/TypedArray;

    move-result-object p1

    invoke-direct {p0, p1, p4}, Landroid/support/b/a/i$c;->a(Landroid/content/res/TypedArray;Lorg/xmlpull/v1/XmlPullParser;)V

    invoke-virtual {p1}, Landroid/content/res/TypedArray;->recycle()V

    return-void
.end method

.method public getGroupName()Ljava/lang/String;
    .locals 1

    iget-object v0, p0, Landroid/support/b/a/i$c;->m:Ljava/lang/String;

    return-object v0
.end method

.method public getLocalMatrix()Landroid/graphics/Matrix;
    .locals 1

    iget-object v0, p0, Landroid/support/b/a/i$c;->k:Landroid/graphics/Matrix;

    return-object v0
.end method

.method public getPivotX()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->e:F

    return v0
.end method

.method public getPivotY()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->f:F

    return v0
.end method

.method public getRotation()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->b:F

    return v0
.end method

.method public getScaleX()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->g:F

    return v0
.end method

.method public getScaleY()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->h:F

    return v0
.end method

.method public getTranslateX()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->i:F

    return v0
.end method

.method public getTranslateY()F
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->j:F

    return v0
.end method

.method public setPivotX(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->e:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->e:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method

.method public setPivotY(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->f:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->f:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method

.method public setRotation(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->b:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->b:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method

.method public setScaleX(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->g:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->g:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method

.method public setScaleY(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->h:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->h:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method

.method public setTranslateX(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->i:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->i:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method

.method public setTranslateY(F)V
    .locals 1

    iget v0, p0, Landroid/support/b/a/i$c;->j:F

    cmpl-float v0, p1, v0

    if-eqz v0, :cond_0

    iput p1, p0, Landroid/support/b/a/i$c;->j:F

    invoke-direct {p0}, Landroid/support/b/a/i$c;->a()V

    :cond_0
    return-void
.end method
