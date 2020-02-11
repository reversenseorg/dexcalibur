.class public Landroid/support/v7/widget/aj;
.super Landroid/view/ViewGroup;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/support/v7/widget/aj$a;
    }
.end annotation


# instance fields
.field private a:Z

.field private b:I

.field private c:I

.field private d:I

.field private e:I

.field private f:I

.field private g:F

.field private h:Z

.field private i:[I

.field private j:[I

.field private k:Landroid/graphics/drawable/Drawable;

.field private l:I

.field private m:I

.field private n:I

.field private o:I


# direct methods
.method public constructor <init>(Landroid/content/Context;)V
    .locals 1

    const/4 v0, 0x0

    invoke-direct {p0, p1, v0}, Landroid/support/v7/widget/aj;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;)V

    return-void
.end method

.method public constructor <init>(Landroid/content/Context;Landroid/util/AttributeSet;)V
    .locals 1

    const/4 v0, 0x0

    invoke-direct {p0, p1, p2, v0}, Landroid/support/v7/widget/aj;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;I)V

    return-void
.end method

.method public constructor <init>(Landroid/content/Context;Landroid/util/AttributeSet;I)V
    .locals 4

    invoke-direct {p0, p1, p2, p3}, Landroid/view/ViewGroup;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;I)V

    const/4 v0, 0x1

    iput-boolean v0, p0, Landroid/support/v7/widget/aj;->a:Z

    const/4 v1, -0x1

    iput v1, p0, Landroid/support/v7/widget/aj;->b:I

    const/4 v2, 0x0

    iput v2, p0, Landroid/support/v7/widget/aj;->c:I

    const v3, 0x800033

    iput v3, p0, Landroid/support/v7/widget/aj;->e:I

    sget-object v3, Landroid/support/v7/a/a$j;->LinearLayoutCompat:[I

    invoke-static {p1, p2, v3, p3, v2}, Landroid/support/v7/widget/aw;->a(Landroid/content/Context;Landroid/util/AttributeSet;[III)Landroid/support/v7/widget/aw;

    move-result-object p1

    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_android_orientation:I

    invoke-virtual {p1, p2, v1}, Landroid/support/v7/widget/aw;->a(II)I

    move-result p2

    if-ltz p2, :cond_0

    invoke-virtual {p0, p2}, Landroid/support/v7/widget/aj;->setOrientation(I)V

    :cond_0
    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_android_gravity:I

    invoke-virtual {p1, p2, v1}, Landroid/support/v7/widget/aw;->a(II)I

    move-result p2

    if-ltz p2, :cond_1

    invoke-virtual {p0, p2}, Landroid/support/v7/widget/aj;->setGravity(I)V

    :cond_1
    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_android_baselineAligned:I

    invoke-virtual {p1, p2, v0}, Landroid/support/v7/widget/aw;->a(IZ)Z

    move-result p2

    if-nez p2, :cond_2

    invoke-virtual {p0, p2}, Landroid/support/v7/widget/aj;->setBaselineAligned(Z)V

    :cond_2
    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_android_weightSum:I

    const/high16 p3, -0x40800000    # -1.0f

    invoke-virtual {p1, p2, p3}, Landroid/support/v7/widget/aw;->a(IF)F

    move-result p2

    iput p2, p0, Landroid/support/v7/widget/aj;->g:F

    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_android_baselineAlignedChildIndex:I

    invoke-virtual {p1, p2, v1}, Landroid/support/v7/widget/aw;->a(II)I

    move-result p2

    iput p2, p0, Landroid/support/v7/widget/aj;->b:I

    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_measureWithLargestChild:I

    invoke-virtual {p1, p2, v2}, Landroid/support/v7/widget/aw;->a(IZ)Z

    move-result p2

    iput-boolean p2, p0, Landroid/support/v7/widget/aj;->h:Z

    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_divider:I

    invoke-virtual {p1, p2}, Landroid/support/v7/widget/aw;->a(I)Landroid/graphics/drawable/Drawable;

    move-result-object p2

    invoke-virtual {p0, p2}, Landroid/support/v7/widget/aj;->setDividerDrawable(Landroid/graphics/drawable/Drawable;)V

    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_showDividers:I

    invoke-virtual {p1, p2, v2}, Landroid/support/v7/widget/aw;->a(II)I

    move-result p2

    iput p2, p0, Landroid/support/v7/widget/aj;->n:I

    sget p2, Landroid/support/v7/a/a$j;->LinearLayoutCompat_dividerPadding:I

    invoke-virtual {p1, p2, v2}, Landroid/support/v7/widget/aw;->e(II)I

    move-result p2

    iput p2, p0, Landroid/support/v7/widget/aj;->o:I

    invoke-virtual {p1}, Landroid/support/v7/widget/aw;->a()V

    return-void
.end method

.method private a(Landroid/view/View;IIII)V
    .locals 0

    add-int/2addr p4, p2

    add-int/2addr p5, p3

    invoke-virtual {p1, p2, p3, p4, p5}, Landroid/view/View;->layout(IIII)V

    return-void
.end method

.method private c(II)V
    .locals 10

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getMeasuredWidth()I

    move-result v0

    const/high16 v1, 0x40000000    # 2.0f

    invoke-static {v0, v1}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v0

    const/4 v1, 0x0

    :goto_0
    if-ge v1, p1, :cond_1

    invoke-virtual {p0, v1}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v3

    invoke-virtual {v3}, Landroid/view/View;->getVisibility()I

    move-result v2

    const/16 v4, 0x8

    if-eq v2, v4, :cond_0

    invoke-virtual {v3}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v2

    move-object v8, v2

    check-cast v8, Landroid/support/v7/widget/aj$a;

    iget v2, v8, Landroid/support/v7/widget/aj$a;->width:I

    const/4 v4, -0x1

    if-ne v2, v4, :cond_0

    iget v9, v8, Landroid/support/v7/widget/aj$a;->height:I

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredHeight()I

    move-result v2

    iput v2, v8, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v5, 0x0

    const/4 v7, 0x0

    move-object v2, p0

    move v4, v0

    move v6, p2

    invoke-virtual/range {v2 .. v7}, Landroid/support/v7/widget/aj;->measureChildWithMargins(Landroid/view/View;IIII)V

    iput v9, v8, Landroid/support/v7/widget/aj$a;->height:I

    :cond_0
    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_1
    return-void
.end method

.method private d(II)V
    .locals 10

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getMeasuredHeight()I

    move-result v0

    const/high16 v1, 0x40000000    # 2.0f

    invoke-static {v0, v1}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v0

    const/4 v1, 0x0

    :goto_0
    if-ge v1, p1, :cond_1

    invoke-virtual {p0, v1}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v3

    invoke-virtual {v3}, Landroid/view/View;->getVisibility()I

    move-result v2

    const/16 v4, 0x8

    if-eq v2, v4, :cond_0

    invoke-virtual {v3}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v2

    move-object v8, v2

    check-cast v8, Landroid/support/v7/widget/aj$a;

    iget v2, v8, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v4, -0x1

    if-ne v2, v4, :cond_0

    iget v9, v8, Landroid/support/v7/widget/aj$a;->width:I

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredWidth()I

    move-result v2

    iput v2, v8, Landroid/support/v7/widget/aj$a;->width:I

    const/4 v5, 0x0

    const/4 v7, 0x0

    move-object v2, p0

    move v4, p2

    move v6, v0

    invoke-virtual/range {v2 .. v7}, Landroid/support/v7/widget/aj;->measureChildWithMargins(Landroid/view/View;IIII)V

    iput v9, v8, Landroid/support/v7/widget/aj$a;->width:I

    :cond_0
    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_1
    return-void
.end method


# virtual methods
.method a(Landroid/view/View;)I
    .locals 0

    const/4 p1, 0x0

    return p1
.end method

.method a(Landroid/view/View;I)I
    .locals 0

    const/4 p1, 0x0

    return p1
.end method

.method a(II)V
    .locals 40

    move-object/from16 v7, p0

    move/from16 v8, p1

    move/from16 v9, p2

    const/4 v10, 0x0

    iput v10, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getVirtualChildCount()I

    move-result v11

    invoke-static/range {p1 .. p1}, Landroid/view/View$MeasureSpec;->getMode(I)I

    move-result v12

    invoke-static/range {p2 .. p2}, Landroid/view/View$MeasureSpec;->getMode(I)I

    move-result v13

    iget v14, v7, Landroid/support/v7/widget/aj;->b:I

    iget-boolean v15, v7, Landroid/support/v7/widget/aj;->h:Z

    const/16 v16, 0x0

    const/16 v17, 0x1

    const/4 v0, 0x0

    const/4 v1, 0x0

    const/4 v2, 0x0

    const/4 v3, 0x0

    const/4 v4, 0x0

    const/4 v5, 0x0

    const/4 v6, 0x0

    const/16 v18, 0x0

    const/16 v19, 0x1

    const/16 v20, 0x0

    :goto_0
    const/16 v10, 0x8

    move/from16 v22, v4

    if-ge v6, v11, :cond_10

    invoke-virtual {v7, v6}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v4

    if-nez v4, :cond_0

    iget v4, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v7, v6}, Landroid/support/v7/widget/aj;->d(I)I

    move-result v10

    add-int/2addr v4, v10

    iput v4, v7, Landroid/support/v7/widget/aj;->f:I

    move/from16 v32, v11

    move/from16 v31, v13

    move/from16 v4, v22

    goto/16 :goto_b

    :cond_0
    move/from16 v24, v1

    invoke-virtual {v4}, Landroid/view/View;->getVisibility()I

    move-result v1

    if-ne v1, v10, :cond_1

    invoke-virtual {v7, v4, v6}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v1

    add-int/2addr v6, v1

    move/from16 v32, v11

    move/from16 v31, v13

    move/from16 v4, v22

    move/from16 v1, v24

    goto/16 :goto_b

    :cond_1
    invoke-virtual {v7, v6}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v1

    if-eqz v1, :cond_2

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    iget v10, v7, Landroid/support/v7/widget/aj;->m:I

    add-int/2addr v1, v10

    iput v1, v7, Landroid/support/v7/widget/aj;->f:I

    :cond_2
    invoke-virtual {v4}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v1

    move-object v10, v1

    check-cast v10, Landroid/support/v7/widget/aj$a;

    iget v1, v10, Landroid/support/v7/widget/aj$a;->g:F

    add-float v25, v0, v1

    const/high16 v1, 0x40000000    # 2.0f

    if-ne v13, v1, :cond_3

    iget v0, v10, Landroid/support/v7/widget/aj$a;->height:I

    if-nez v0, :cond_3

    iget v0, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v0, v0, v16

    if-lez v0, :cond_3

    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    iget v1, v10, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int/2addr v1, v0

    move/from16 v26, v2

    iget v2, v10, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v1, v2

    invoke-static {v0, v1}, Ljava/lang/Math;->max(II)I

    move-result v0

    iput v0, v7, Landroid/support/v7/widget/aj;->f:I

    move v0, v3

    move-object v3, v4

    move/from16 v33, v5

    move/from16 v32, v11

    move/from16 v31, v13

    move/from16 v13, v22

    move/from16 v8, v24

    move/from16 v29, v26

    const/16 v18, 0x1

    move v11, v6

    goto/16 :goto_3

    :cond_3
    move/from16 v26, v2

    iget v0, v10, Landroid/support/v7/widget/aj$a;->height:I

    if-nez v0, :cond_4

    iget v0, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v0, v0, v16

    if-lez v0, :cond_4

    const/4 v0, -0x2

    iput v0, v10, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v2, 0x0

    goto :goto_1

    :cond_4
    const/high16 v2, -0x80000000

    :goto_1
    const/16 v23, 0x0

    cmpl-float v0, v25, v16

    if-nez v0, :cond_5

    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    move/from16 v27, v0

    goto :goto_2

    :cond_5
    const/16 v27, 0x0

    :goto_2
    move-object/from16 v0, p0

    move/from16 v8, v24

    const/high16 v24, 0x40000000    # 2.0f

    move-object v1, v4

    move/from16 v28, v2

    move/from16 v29, v26

    move v2, v6

    move v9, v3

    move/from16 v3, p1

    move-object/from16 v30, v4

    move/from16 v32, v11

    move/from16 v31, v13

    move/from16 v13, v22

    const/high16 v11, 0x40000000    # 2.0f

    move/from16 v4, v23

    move/from16 v33, v5

    move/from16 v5, p2

    move v11, v6

    move/from16 v6, v27

    invoke-virtual/range {v0 .. v6}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;IIIII)V

    move/from16 v0, v28

    const/high16 v1, -0x80000000

    if-eq v0, v1, :cond_6

    iput v0, v10, Landroid/support/v7/widget/aj$a;->height:I

    :cond_6
    invoke-virtual/range {v30 .. v30}, Landroid/view/View;->getMeasuredHeight()I

    move-result v0

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    add-int v2, v1, v0

    iget v3, v10, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int/2addr v2, v3

    iget v3, v10, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v2, v3

    move-object/from16 v3, v30

    invoke-virtual {v7, v3}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v4

    add-int/2addr v2, v4

    invoke-static {v1, v2}, Ljava/lang/Math;->max(II)I

    move-result v1

    iput v1, v7, Landroid/support/v7/widget/aj;->f:I

    if-eqz v15, :cond_7

    invoke-static {v0, v9}, Ljava/lang/Math;->max(II)I

    move-result v0

    goto :goto_3

    :cond_7
    move v0, v9

    :goto_3
    if-ltz v14, :cond_8

    add-int/lit8 v6, v11, 0x1

    if-ne v14, v6, :cond_8

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    iput v1, v7, Landroid/support/v7/widget/aj;->c:I

    :cond_8
    if-ge v11, v14, :cond_a

    iget v1, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v1, v1, v16

    if-gtz v1, :cond_9

    goto :goto_4

    :cond_9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "A child of LinearLayout with index less than mBaselineAlignedChildIndex has weight > 0, which won\'t work.  Either remove the weight, or don\'t set mBaselineAlignedChildIndex."

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0

    :cond_a
    :goto_4
    const/high16 v1, 0x40000000    # 2.0f

    if-eq v12, v1, :cond_b

    iget v1, v10, Landroid/support/v7/widget/aj$a;->width:I

    const/4 v2, -0x1

    if-ne v1, v2, :cond_b

    const/4 v1, 0x1

    const/16 v20, 0x1

    goto :goto_5

    :cond_b
    const/4 v1, 0x0

    :goto_5
    iget v2, v10, Landroid/support/v7/widget/aj$a;->leftMargin:I

    iget v4, v10, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v2, v4

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredWidth()I

    move-result v4

    add-int/2addr v4, v2

    move/from16 v5, v29

    invoke-static {v5, v4}, Ljava/lang/Math;->max(II)I

    move-result v5

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredState()I

    move-result v6

    invoke-static {v8, v6}, Landroid/view/View;->combineMeasuredStates(II)I

    move-result v6

    if-eqz v19, :cond_c

    iget v8, v10, Landroid/support/v7/widget/aj$a;->width:I

    const/4 v9, -0x1

    if-ne v8, v9, :cond_c

    const/4 v8, 0x1

    goto :goto_6

    :cond_c
    const/4 v8, 0x0

    :goto_6
    iget v9, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v9, v9, v16

    if-lez v9, :cond_e

    if-eqz v1, :cond_d

    goto :goto_7

    :cond_d
    move v2, v4

    :goto_7
    invoke-static {v13, v2}, Ljava/lang/Math;->max(II)I

    move-result v4

    move v13, v4

    move/from16 v1, v33

    goto :goto_a

    :cond_e
    if-eqz v1, :cond_f

    :goto_8
    move/from16 v1, v33

    goto :goto_9

    :cond_f
    move v2, v4

    goto :goto_8

    :goto_9
    invoke-static {v1, v2}, Ljava/lang/Math;->max(II)I

    move-result v1

    :goto_a
    invoke-virtual {v7, v3, v11}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v2

    add-int/2addr v2, v11

    move v3, v0

    move/from16 v19, v8

    move v4, v13

    move/from16 v0, v25

    move/from16 v39, v5

    move v5, v1

    move v1, v6

    move v6, v2

    move/from16 v2, v39

    :goto_b
    add-int/lit8 v6, v6, 0x1

    move/from16 v13, v31

    move/from16 v11, v32

    move/from16 v8, p1

    move/from16 v9, p2

    goto/16 :goto_0

    :cond_10
    move v8, v1

    move v9, v3

    move v1, v5

    move/from16 v32, v11

    move/from16 v31, v13

    move/from16 v13, v22

    move v5, v2

    iget v2, v7, Landroid/support/v7/widget/aj;->f:I

    if-lez v2, :cond_11

    move/from16 v2, v32

    invoke-virtual {v7, v2}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v3

    if-eqz v3, :cond_12

    iget v3, v7, Landroid/support/v7/widget/aj;->f:I

    iget v4, v7, Landroid/support/v7/widget/aj;->m:I

    add-int/2addr v3, v4

    iput v3, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_c

    :cond_11
    move/from16 v2, v32

    :cond_12
    :goto_c
    if-eqz v15, :cond_16

    move/from16 v3, v31

    const/high16 v4, -0x80000000

    if-eq v3, v4, :cond_13

    if-nez v3, :cond_17

    :cond_13
    const/4 v4, 0x0

    iput v4, v7, Landroid/support/v7/widget/aj;->f:I

    const/4 v4, 0x0

    :goto_d
    if-ge v4, v2, :cond_17

    invoke-virtual {v7, v4}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v6

    if-nez v6, :cond_14

    iget v6, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v7, v4}, Landroid/support/v7/widget/aj;->d(I)I

    move-result v11

    add-int/2addr v6, v11

    :goto_e
    iput v6, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_f

    :cond_14
    invoke-virtual {v6}, Landroid/view/View;->getVisibility()I

    move-result v11

    if-ne v11, v10, :cond_15

    invoke-virtual {v7, v6, v4}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v6

    add-int/2addr v4, v6

    goto :goto_f

    :cond_15
    invoke-virtual {v6}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v11

    check-cast v11, Landroid/support/v7/widget/aj$a;

    iget v14, v7, Landroid/support/v7/widget/aj;->f:I

    add-int v21, v14, v9

    iget v10, v11, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int v21, v21, v10

    iget v10, v11, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int v21, v21, v10

    invoke-virtual {v7, v6}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v6

    add-int v6, v21, v6

    invoke-static {v14, v6}, Ljava/lang/Math;->max(II)I

    move-result v6

    goto :goto_e

    :goto_f
    add-int/lit8 v4, v4, 0x1

    const/16 v10, 0x8

    goto :goto_d

    :cond_16
    move/from16 v3, v31

    :cond_17
    iget v4, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v6

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v10

    add-int/2addr v6, v10

    add-int/2addr v4, v6

    iput v4, v7, Landroid/support/v7/widget/aj;->f:I

    iget v4, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getSuggestedMinimumHeight()I

    move-result v6

    invoke-static {v4, v6}, Ljava/lang/Math;->max(II)I

    move-result v4

    move v10, v9

    move/from16 v6, p2

    const/4 v9, 0x0

    invoke-static {v4, v6, v9}, Landroid/view/View;->resolveSizeAndState(III)I

    move-result v4

    const v9, 0xffffff

    and-int/2addr v9, v4

    iget v11, v7, Landroid/support/v7/widget/aj;->f:I

    sub-int/2addr v9, v11

    if-nez v18, :cond_1c

    if-eqz v9, :cond_18

    cmpl-float v11, v0, v16

    if-lez v11, :cond_18

    goto :goto_12

    :cond_18
    invoke-static {v1, v13}, Ljava/lang/Math;->max(II)I

    move-result v0

    if-eqz v15, :cond_1b

    const/high16 v1, 0x40000000    # 2.0f

    if-eq v3, v1, :cond_1b

    const/4 v1, 0x0

    :goto_10
    if-ge v1, v2, :cond_1b

    invoke-virtual {v7, v1}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v3

    if-eqz v3, :cond_1a

    invoke-virtual {v3}, Landroid/view/View;->getVisibility()I

    move-result v9

    const/16 v11, 0x8

    if-ne v9, v11, :cond_19

    goto :goto_11

    :cond_19
    invoke-virtual {v3}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v9

    check-cast v9, Landroid/support/v7/widget/aj$a;

    iget v9, v9, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v9, v9, v16

    if-lez v9, :cond_1a

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredWidth()I

    move-result v9

    const/high16 v11, 0x40000000    # 2.0f

    invoke-static {v9, v11}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v9

    invoke-static {v10, v11}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v13

    invoke-virtual {v3, v9, v13}, Landroid/view/View;->measure(II)V

    :cond_1a
    :goto_11
    add-int/lit8 v1, v1, 0x1

    goto :goto_10

    :cond_1b
    move v1, v8

    move/from16 v11, p1

    goto/16 :goto_1b

    :cond_1c
    :goto_12
    iget v10, v7, Landroid/support/v7/widget/aj;->g:F

    cmpl-float v10, v10, v16

    if-lez v10, :cond_1d

    iget v0, v7, Landroid/support/v7/widget/aj;->g:F

    :cond_1d
    const/4 v10, 0x0

    iput v10, v7, Landroid/support/v7/widget/aj;->f:I

    move v11, v0

    const/4 v0, 0x0

    move/from16 v39, v8

    move v8, v1

    move/from16 v1, v39

    :goto_13
    if-ge v0, v2, :cond_28

    invoke-virtual {v7, v0}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v13

    invoke-virtual {v13}, Landroid/view/View;->getVisibility()I

    move-result v14

    const/16 v15, 0x8

    if-ne v14, v15, :cond_1e

    move/from16 v38, v3

    move v10, v11

    move/from16 v11, p1

    goto/16 :goto_1a

    :cond_1e
    invoke-virtual {v13}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v14

    check-cast v14, Landroid/support/v7/widget/aj$a;

    iget v10, v14, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v18, v10, v16

    if-lez v18, :cond_23

    int-to-float v15, v9

    mul-float v15, v15, v10

    div-float/2addr v15, v11

    float-to-int v15, v15

    sub-float/2addr v11, v10

    sub-int/2addr v9, v15

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v10

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v18

    add-int v10, v10, v18

    move/from16 v34, v9

    iget v9, v14, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v10, v9

    iget v9, v14, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v10, v9

    iget v9, v14, Landroid/support/v7/widget/aj$a;->width:I

    move/from16 v35, v11

    move/from16 v11, p1

    invoke-static {v11, v10, v9}, Landroid/support/v7/widget/aj;->getChildMeasureSpec(III)I

    move-result v9

    iget v10, v14, Landroid/support/v7/widget/aj$a;->height:I

    if-nez v10, :cond_20

    const/high16 v10, 0x40000000    # 2.0f

    if-eq v3, v10, :cond_1f

    goto :goto_14

    :cond_1f
    if-lez v15, :cond_21

    goto :goto_15

    :cond_20
    const/high16 v10, 0x40000000    # 2.0f

    :goto_14
    invoke-virtual {v13}, Landroid/view/View;->getMeasuredHeight()I

    move-result v18

    add-int v15, v18, v15

    if-gez v15, :cond_22

    :cond_21
    const/4 v15, 0x0

    :cond_22
    :goto_15
    invoke-static {v15, v10}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v15

    invoke-virtual {v13, v9, v15}, Landroid/view/View;->measure(II)V

    invoke-virtual {v13}, Landroid/view/View;->getMeasuredState()I

    move-result v9

    and-int/lit16 v9, v9, -0x100

    invoke-static {v1, v9}, Landroid/view/View;->combineMeasuredStates(II)I

    move-result v1

    move/from16 v9, v34

    move/from16 v10, v35

    goto :goto_16

    :cond_23
    move v10, v11

    move/from16 v11, p1

    :goto_16
    iget v15, v14, Landroid/support/v7/widget/aj$a;->leftMargin:I

    move/from16 v36, v1

    iget v1, v14, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v15, v1

    invoke-virtual {v13}, Landroid/view/View;->getMeasuredWidth()I

    move-result v1

    add-int/2addr v1, v15

    invoke-static {v5, v1}, Ljava/lang/Math;->max(II)I

    move-result v5

    move/from16 v37, v1

    const/high16 v1, 0x40000000    # 2.0f

    if-eq v12, v1, :cond_24

    iget v1, v14, Landroid/support/v7/widget/aj$a;->width:I

    move/from16 v38, v3

    const/4 v3, -0x1

    if-ne v1, v3, :cond_25

    const/4 v1, 0x1

    goto :goto_17

    :cond_24
    move/from16 v38, v3

    const/4 v3, -0x1

    :cond_25
    const/4 v1, 0x0

    :goto_17
    if-eqz v1, :cond_26

    goto :goto_18

    :cond_26
    move/from16 v15, v37

    :goto_18
    invoke-static {v8, v15}, Ljava/lang/Math;->max(II)I

    move-result v1

    if-eqz v19, :cond_27

    iget v8, v14, Landroid/support/v7/widget/aj$a;->width:I

    if-ne v8, v3, :cond_27

    const/4 v8, 0x1

    goto :goto_19

    :cond_27
    const/4 v8, 0x0

    :goto_19
    iget v15, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v13}, Landroid/view/View;->getMeasuredHeight()I

    move-result v18

    add-int v18, v15, v18

    iget v3, v14, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int v18, v18, v3

    iget v3, v14, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int v18, v18, v3

    invoke-virtual {v7, v13}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v3

    add-int v3, v18, v3

    invoke-static {v15, v3}, Ljava/lang/Math;->max(II)I

    move-result v3

    iput v3, v7, Landroid/support/v7/widget/aj;->f:I

    move/from16 v19, v8

    move v8, v1

    move/from16 v1, v36

    :goto_1a
    add-int/lit8 v0, v0, 0x1

    move v11, v10

    move/from16 v3, v38

    const/4 v10, 0x0

    goto/16 :goto_13

    :cond_28
    move/from16 v11, p1

    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v3

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v9

    add-int/2addr v3, v9

    add-int/2addr v0, v3

    iput v0, v7, Landroid/support/v7/widget/aj;->f:I

    move v0, v8

    :goto_1b
    if-nez v19, :cond_29

    const/high16 v3, 0x40000000    # 2.0f

    if-eq v12, v3, :cond_29

    goto :goto_1c

    :cond_29
    move v0, v5

    :goto_1c
    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v3

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v5

    add-int/2addr v3, v5

    add-int/2addr v0, v3

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getSuggestedMinimumWidth()I

    move-result v3

    invoke-static {v0, v3}, Ljava/lang/Math;->max(II)I

    move-result v0

    invoke-static {v0, v11, v1}, Landroid/view/View;->resolveSizeAndState(III)I

    move-result v0

    invoke-virtual {v7, v0, v4}, Landroid/support/v7/widget/aj;->setMeasuredDimension(II)V

    if-eqz v20, :cond_2a

    invoke-direct {v7, v2, v6}, Landroid/support/v7/widget/aj;->c(II)V

    :cond_2a
    return-void
.end method

.method a(IIII)V
    .locals 17

    move-object/from16 v6, p0

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v7

    sub-int v2, p3, p1

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v3

    sub-int v8, v2, v3

    sub-int/2addr v2, v7

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v3

    sub-int v9, v2, v3

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getVirtualChildCount()I

    move-result v10

    iget v2, v6, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v2, v2, 0x70

    iget v3, v6, Landroid/support/v7/widget/aj;->e:I

    const v4, 0x800007

    and-int v11, v3, v4

    const/16 v3, 0x10

    if-eq v2, v3, :cond_1

    const/16 v3, 0x50

    if-eq v2, v3, :cond_0

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v0

    goto :goto_0

    :cond_0
    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v2

    add-int v2, v2, p4

    sub-int v2, v2, p2

    iget v0, v6, Landroid/support/v7/widget/aj;->f:I

    sub-int v0, v2, v0

    goto :goto_0

    :cond_1
    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v2

    sub-int v0, p4, p2

    iget v1, v6, Landroid/support/v7/widget/aj;->f:I

    sub-int/2addr v0, v1

    div-int/lit8 v0, v0, 0x2

    add-int/2addr v0, v2

    :goto_0
    const/4 v1, 0x0

    const/4 v12, 0x0

    :goto_1
    if-ge v12, v10, :cond_8

    invoke-virtual {v6, v12}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v13

    const/4 v14, 0x1

    if-nez v13, :cond_3

    invoke-virtual {v6, v12}, Landroid/support/v7/widget/aj;->d(I)I

    move-result v1

    add-int/2addr v0, v1

    :cond_2
    :goto_2
    const/4 v1, 0x1

    goto/16 :goto_6

    :cond_3
    invoke-virtual {v13}, Landroid/view/View;->getVisibility()I

    move-result v1

    const/16 v2, 0x8

    if-eq v1, v2, :cond_2

    invoke-virtual {v13}, Landroid/view/View;->getMeasuredWidth()I

    move-result v4

    invoke-virtual {v13}, Landroid/view/View;->getMeasuredHeight()I

    move-result v15

    invoke-virtual {v13}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v1

    move-object v5, v1

    check-cast v5, Landroid/support/v7/widget/aj$a;

    iget v1, v5, Landroid/support/v7/widget/aj$a;->h:I

    if-gez v1, :cond_4

    move v1, v11

    :cond_4
    invoke-static/range {p0 .. p0}, Landroid/support/v4/g/p;->b(Landroid/view/View;)I

    move-result v2

    invoke-static {v1, v2}, Landroid/support/v4/g/d;->a(II)I

    move-result v1

    and-int/lit8 v1, v1, 0x7

    if-eq v1, v14, :cond_6

    const/4 v2, 0x5

    if-eq v1, v2, :cond_5

    iget v1, v5, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v1, v7

    :goto_3
    move v2, v1

    goto :goto_5

    :cond_5
    sub-int v1, v8, v4

    goto :goto_4

    :cond_6
    sub-int v1, v9, v4

    div-int/lit8 v1, v1, 0x2

    add-int/2addr v1, v7

    iget v2, v5, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v1, v2

    :goto_4
    iget v2, v5, Landroid/support/v7/widget/aj$a;->rightMargin:I

    sub-int/2addr v1, v2

    goto :goto_3

    :goto_5
    invoke-virtual {v6, v12}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v1

    if-eqz v1, :cond_7

    iget v1, v6, Landroid/support/v7/widget/aj;->m:I

    add-int/2addr v0, v1

    :cond_7
    iget v1, v5, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int v16, v0, v1

    invoke-virtual {v6, v13}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;)I

    move-result v0

    add-int v3, v16, v0

    move-object/from16 v0, p0

    move-object v1, v13

    move-object v14, v5

    move v5, v15

    invoke-direct/range {v0 .. v5}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;IIII)V

    iget v0, v14, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v15, v0

    invoke-virtual {v6, v13}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v0

    add-int/2addr v15, v0

    add-int v16, v16, v15

    invoke-virtual {v6, v13, v12}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v0

    add-int/2addr v12, v0

    move/from16 v0, v16

    goto :goto_2

    :goto_6
    add-int/2addr v12, v1

    goto :goto_1

    :cond_8
    return-void
.end method

.method a(Landroid/graphics/Canvas;)V
    .locals 5

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getVirtualChildCount()I

    move-result v0

    const/4 v1, 0x0

    :goto_0
    if-ge v1, v0, :cond_1

    invoke-virtual {p0, v1}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v2

    if-eqz v2, :cond_0

    invoke-virtual {v2}, Landroid/view/View;->getVisibility()I

    move-result v3

    const/16 v4, 0x8

    if-eq v3, v4, :cond_0

    invoke-virtual {p0, v1}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v3

    if-eqz v3, :cond_0

    invoke-virtual {v2}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v3

    check-cast v3, Landroid/support/v7/widget/aj$a;

    invoke-virtual {v2}, Landroid/view/View;->getTop()I

    move-result v2

    iget v3, v3, Landroid/support/v7/widget/aj$a;->topMargin:I

    sub-int/2addr v2, v3

    iget v3, p0, Landroid/support/v7/widget/aj;->m:I

    sub-int/2addr v2, v3

    invoke-virtual {p0, p1, v2}, Landroid/support/v7/widget/aj;->a(Landroid/graphics/Canvas;I)V

    :cond_0
    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_1
    invoke-virtual {p0, v0}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v1

    if-eqz v1, :cond_3

    add-int/lit8 v0, v0, -0x1

    invoke-virtual {p0, v0}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v0

    if-nez v0, :cond_2

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getHeight()I

    move-result v0

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v1

    sub-int/2addr v0, v1

    iget v1, p0, Landroid/support/v7/widget/aj;->m:I

    sub-int/2addr v0, v1

    goto :goto_1

    :cond_2
    invoke-virtual {v0}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v1

    check-cast v1, Landroid/support/v7/widget/aj$a;

    invoke-virtual {v0}, Landroid/view/View;->getBottom()I

    move-result v0

    iget v1, v1, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v0, v1

    :goto_1
    invoke-virtual {p0, p1, v0}, Landroid/support/v7/widget/aj;->a(Landroid/graphics/Canvas;I)V

    :cond_3
    return-void
.end method

.method a(Landroid/graphics/Canvas;I)V
    .locals 4

    iget-object v0, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v1

    iget v2, p0, Landroid/support/v7/widget/aj;->o:I

    add-int/2addr v1, v2

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getWidth()I

    move-result v2

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v3

    sub-int/2addr v2, v3

    iget v3, p0, Landroid/support/v7/widget/aj;->o:I

    sub-int/2addr v2, v3

    iget v3, p0, Landroid/support/v7/widget/aj;->m:I

    add-int/2addr v3, p2

    invoke-virtual {v0, v1, p2, v2, v3}, Landroid/graphics/drawable/Drawable;->setBounds(IIII)V

    iget-object p2, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    invoke-virtual {p2, p1}, Landroid/graphics/drawable/Drawable;->draw(Landroid/graphics/Canvas;)V

    return-void
.end method

.method a(Landroid/view/View;IIIII)V
    .locals 6

    move-object v0, p0

    move-object v1, p1

    move v2, p3

    move v3, p4

    move v4, p5

    move v5, p6

    invoke-virtual/range {v0 .. v5}, Landroid/support/v7/widget/aj;->measureChildWithMargins(Landroid/view/View;IIII)V

    return-void
.end method

.method b(Landroid/view/View;)I
    .locals 0

    const/4 p1, 0x0

    return p1
.end method

.method public b(Landroid/util/AttributeSet;)Landroid/support/v7/widget/aj$a;
    .locals 2

    new-instance v0, Landroid/support/v7/widget/aj$a;

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getContext()Landroid/content/Context;

    move-result-object v1

    invoke-direct {v0, v1, p1}, Landroid/support/v7/widget/aj$a;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;)V

    return-object v0
.end method

.method protected b(Landroid/view/ViewGroup$LayoutParams;)Landroid/support/v7/widget/aj$a;
    .locals 1

    new-instance v0, Landroid/support/v7/widget/aj$a;

    invoke-direct {v0, p1}, Landroid/support/v7/widget/aj$a;-><init>(Landroid/view/ViewGroup$LayoutParams;)V

    return-object v0
.end method

.method b(I)Landroid/view/View;
    .locals 0

    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->getChildAt(I)Landroid/view/View;

    move-result-object p1

    return-object p1
.end method

.method b(II)V
    .locals 44

    move-object/from16 v7, p0

    move/from16 v8, p1

    move/from16 v9, p2

    const/4 v10, 0x0

    iput v10, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getVirtualChildCount()I

    move-result v11

    invoke-static/range {p1 .. p1}, Landroid/view/View$MeasureSpec;->getMode(I)I

    move-result v12

    invoke-static/range {p2 .. p2}, Landroid/view/View$MeasureSpec;->getMode(I)I

    move-result v13

    iget-object v0, v7, Landroid/support/v7/widget/aj;->i:[I

    const/4 v14, 0x4

    if-eqz v0, :cond_0

    iget-object v0, v7, Landroid/support/v7/widget/aj;->j:[I

    if-nez v0, :cond_1

    :cond_0
    new-array v0, v14, [I

    iput-object v0, v7, Landroid/support/v7/widget/aj;->i:[I

    new-array v0, v14, [I

    iput-object v0, v7, Landroid/support/v7/widget/aj;->j:[I

    :cond_1
    iget-object v15, v7, Landroid/support/v7/widget/aj;->i:[I

    iget-object v6, v7, Landroid/support/v7/widget/aj;->j:[I

    const/16 v16, 0x3

    const/4 v5, -0x1

    aput v5, v15, v16

    const/16 v17, 0x2

    aput v5, v15, v17

    const/16 v18, 0x1

    aput v5, v15, v18

    aput v5, v15, v10

    aput v5, v6, v16

    aput v5, v6, v17

    aput v5, v6, v18

    aput v5, v6, v10

    iget-boolean v4, v7, Landroid/support/v7/widget/aj;->a:Z

    iget-boolean v3, v7, Landroid/support/v7/widget/aj;->h:Z

    const/high16 v2, 0x40000000    # 2.0f

    if-ne v12, v2, :cond_2

    const/16 v19, 0x1

    goto :goto_0

    :cond_2
    const/16 v19, 0x0

    :goto_0
    const/16 v20, 0x0

    const/4 v0, 0x0

    const/4 v1, 0x0

    const/4 v14, 0x0

    const/16 v21, 0x0

    const/16 v22, 0x0

    const/16 v23, 0x0

    const/16 v24, 0x0

    const/16 v26, 0x0

    const/16 v27, 0x1

    const/16 v28, 0x0

    :goto_1
    move-object/from16 v29, v6

    const/16 v5, 0x8

    if-ge v1, v11, :cond_15

    invoke-virtual {v7, v1}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v6

    if-nez v6, :cond_3

    iget v5, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v7, v1}, Landroid/support/v7/widget/aj;->d(I)I

    move-result v6

    add-int/2addr v5, v6

    iput v5, v7, Landroid/support/v7/widget/aj;->f:I

    :goto_2
    move/from16 v32, v3

    move/from16 v36, v4

    goto/16 :goto_12

    :cond_3
    invoke-virtual {v6}, Landroid/view/View;->getVisibility()I

    move-result v10

    if-ne v10, v5, :cond_4

    invoke-virtual {v7, v6, v1}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v5

    add-int/2addr v1, v5

    goto :goto_2

    :cond_4
    invoke-virtual {v7, v1}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v5

    if-eqz v5, :cond_5

    iget v5, v7, Landroid/support/v7/widget/aj;->f:I

    iget v10, v7, Landroid/support/v7/widget/aj;->l:I

    add-int/2addr v5, v10

    iput v5, v7, Landroid/support/v7/widget/aj;->f:I

    :cond_5
    invoke-virtual {v6}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v5

    move-object v10, v5

    check-cast v10, Landroid/support/v7/widget/aj$a;

    iget v5, v10, Landroid/support/v7/widget/aj$a;->g:F

    add-float v31, v0, v5

    if-ne v12, v2, :cond_8

    iget v0, v10, Landroid/support/v7/widget/aj$a;->width:I

    if-nez v0, :cond_8

    iget v0, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v0, v0, v20

    if-lez v0, :cond_8

    if-eqz v19, :cond_6

    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    iget v5, v10, Landroid/support/v7/widget/aj$a;->leftMargin:I

    iget v2, v10, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v5, v2

    add-int/2addr v0, v5

    :goto_3
    iput v0, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_4

    :cond_6
    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    iget v2, v10, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v2, v0

    iget v5, v10, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v2, v5

    invoke-static {v0, v2}, Ljava/lang/Math;->max(II)I

    move-result v0

    goto :goto_3

    :goto_4
    if-eqz v4, :cond_7

    const/4 v0, 0x0

    invoke-static {v0, v0}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v2

    invoke-virtual {v6, v2, v2}, Landroid/view/View;->measure(II)V

    move/from16 v34, v1

    move/from16 v32, v3

    move/from16 v36, v4

    move-object v3, v6

    const/16 v30, -0x2

    goto/16 :goto_9

    :cond_7
    move/from16 v34, v1

    move/from16 v32, v3

    move/from16 v36, v4

    move-object v3, v6

    const/high16 v1, 0x40000000    # 2.0f

    const/16 v22, 0x1

    const/16 v30, -0x2

    goto/16 :goto_a

    :cond_8
    iget v0, v10, Landroid/support/v7/widget/aj$a;->width:I

    if-nez v0, :cond_9

    iget v0, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v0, v0, v20

    if-lez v0, :cond_9

    const/4 v5, -0x2

    iput v5, v10, Landroid/support/v7/widget/aj$a;->width:I

    const/4 v2, 0x0

    goto :goto_5

    :cond_9
    const/4 v5, -0x2

    const/high16 v2, -0x80000000

    :goto_5
    cmpl-float v0, v31, v20

    if-nez v0, :cond_a

    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    move/from16 v30, v0

    goto :goto_6

    :cond_a
    const/16 v30, 0x0

    :goto_6
    const/16 v33, 0x0

    move-object/from16 v0, p0

    move/from16 v34, v1

    move-object v1, v6

    move/from16 v35, v2

    move/from16 v2, v34

    move/from16 v32, v3

    move/from16 v3, p1

    move/from16 v36, v4

    move/from16 v4, v30

    const/4 v9, -0x1

    const/16 v30, -0x2

    move/from16 v5, p2

    move-object/from16 v37, v6

    const/high16 v9, -0x80000000

    move/from16 v6, v33

    invoke-virtual/range {v0 .. v6}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;IIIII)V

    move/from16 v0, v35

    if-eq v0, v9, :cond_b

    iput v0, v10, Landroid/support/v7/widget/aj$a;->width:I

    :cond_b
    invoke-virtual/range {v37 .. v37}, Landroid/view/View;->getMeasuredWidth()I

    move-result v0

    if-eqz v19, :cond_c

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    iget v2, v10, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v2, v0

    iget v3, v10, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v2, v3

    move-object/from16 v3, v37

    invoke-virtual {v7, v3}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v4

    add-int/2addr v2, v4

    add-int/2addr v1, v2

    :goto_7
    iput v1, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_8

    :cond_c
    move-object/from16 v3, v37

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    add-int v2, v1, v0

    iget v4, v10, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v2, v4

    iget v4, v10, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v2, v4

    invoke-virtual {v7, v3}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v4

    add-int/2addr v2, v4

    invoke-static {v1, v2}, Ljava/lang/Math;->max(II)I

    move-result v1

    goto :goto_7

    :goto_8
    if-eqz v32, :cond_d

    invoke-static {v0, v14}, Ljava/lang/Math;->max(II)I

    move-result v14

    :cond_d
    :goto_9
    const/high16 v1, 0x40000000    # 2.0f

    :goto_a
    if-eq v13, v1, :cond_e

    iget v0, v10, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v2, -0x1

    if-ne v0, v2, :cond_e

    const/4 v0, 0x1

    const/16 v28, 0x1

    goto :goto_b

    :cond_e
    const/4 v0, 0x0

    :goto_b
    iget v2, v10, Landroid/support/v7/widget/aj$a;->topMargin:I

    iget v4, v10, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v2, v4

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredHeight()I

    move-result v4

    add-int/2addr v4, v2

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredState()I

    move-result v5

    move/from16 v6, v26

    invoke-static {v6, v5}, Landroid/view/View;->combineMeasuredStates(II)I

    move-result v5

    if-eqz v36, :cond_10

    invoke-virtual {v3}, Landroid/view/View;->getBaseline()I

    move-result v6

    const/4 v9, -0x1

    if-eq v6, v9, :cond_10

    iget v9, v10, Landroid/support/v7/widget/aj$a;->h:I

    if-gez v9, :cond_f

    iget v9, v7, Landroid/support/v7/widget/aj;->e:I

    goto :goto_c

    :cond_f
    iget v9, v10, Landroid/support/v7/widget/aj$a;->h:I

    :goto_c
    and-int/lit8 v9, v9, 0x70

    const/16 v25, 0x4

    shr-int/lit8 v9, v9, 0x4

    and-int/lit8 v9, v9, -0x2

    shr-int/lit8 v9, v9, 0x1

    aget v1, v15, v9

    invoke-static {v1, v6}, Ljava/lang/Math;->max(II)I

    move-result v1

    aput v1, v15, v9

    aget v1, v29, v9

    sub-int v6, v4, v6

    invoke-static {v1, v6}, Ljava/lang/Math;->max(II)I

    move-result v1

    aput v1, v29, v9

    :cond_10
    move/from16 v1, v21

    invoke-static {v1, v4}, Ljava/lang/Math;->max(II)I

    move-result v1

    if-eqz v27, :cond_11

    iget v6, v10, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v9, -0x1

    if-ne v6, v9, :cond_11

    const/4 v6, 0x1

    goto :goto_d

    :cond_11
    const/4 v6, 0x0

    :goto_d
    iget v9, v10, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v9, v9, v20

    if-lez v9, :cond_13

    if-eqz v0, :cond_12

    :goto_e
    move/from16 v10, v24

    goto :goto_f

    :cond_12
    move v2, v4

    goto :goto_e

    :goto_f
    invoke-static {v10, v2}, Ljava/lang/Math;->max(II)I

    move-result v24

    :goto_10
    move/from16 v10, v34

    goto :goto_11

    :cond_13
    move/from16 v10, v24

    if-eqz v0, :cond_14

    move v4, v2

    :cond_14
    move/from16 v2, v23

    invoke-static {v2, v4}, Ljava/lang/Math;->max(II)I

    move-result v23

    move/from16 v24, v10

    goto :goto_10

    :goto_11
    invoke-virtual {v7, v3, v10}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v0

    add-int/2addr v0, v10

    move/from16 v21, v1

    move/from16 v26, v5

    move/from16 v27, v6

    move v1, v0

    move/from16 v0, v31

    :goto_12
    add-int/lit8 v1, v1, 0x1

    move-object/from16 v6, v29

    move/from16 v3, v32

    move/from16 v4, v36

    const/high16 v2, 0x40000000    # 2.0f

    const/4 v5, -0x1

    move/from16 v9, p2

    const/4 v10, 0x0

    goto/16 :goto_1

    :cond_15
    move/from16 v32, v3

    move/from16 v36, v4

    move/from16 v1, v21

    move/from16 v2, v23

    move/from16 v10, v24

    move/from16 v6, v26

    const/high16 v9, -0x80000000

    const/16 v30, -0x2

    iget v3, v7, Landroid/support/v7/widget/aj;->f:I

    if-lez v3, :cond_16

    invoke-virtual {v7, v11}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v3

    if-eqz v3, :cond_16

    iget v3, v7, Landroid/support/v7/widget/aj;->f:I

    iget v4, v7, Landroid/support/v7/widget/aj;->l:I

    add-int/2addr v3, v4

    iput v3, v7, Landroid/support/v7/widget/aj;->f:I

    :cond_16
    aget v3, v15, v18

    const/4 v4, -0x1

    if-ne v3, v4, :cond_18

    const/4 v3, 0x0

    aget v5, v15, v3

    if-ne v5, v4, :cond_18

    aget v3, v15, v17

    if-ne v3, v4, :cond_18

    aget v3, v15, v16

    if-eq v3, v4, :cond_17

    goto :goto_13

    :cond_17
    move/from16 v38, v6

    goto :goto_14

    :cond_18
    :goto_13
    aget v3, v15, v16

    const/4 v4, 0x0

    aget v5, v15, v4

    aget v9, v15, v18

    aget v4, v15, v17

    invoke-static {v9, v4}, Ljava/lang/Math;->max(II)I

    move-result v4

    invoke-static {v5, v4}, Ljava/lang/Math;->max(II)I

    move-result v4

    invoke-static {v3, v4}, Ljava/lang/Math;->max(II)I

    move-result v3

    aget v4, v29, v16

    const/4 v5, 0x0

    aget v9, v29, v5

    aget v5, v29, v18

    move/from16 v38, v6

    aget v6, v29, v17

    invoke-static {v5, v6}, Ljava/lang/Math;->max(II)I

    move-result v5

    invoke-static {v9, v5}, Ljava/lang/Math;->max(II)I

    move-result v5

    invoke-static {v4, v5}, Ljava/lang/Math;->max(II)I

    move-result v4

    add-int/2addr v3, v4

    invoke-static {v1, v3}, Ljava/lang/Math;->max(II)I

    move-result v21

    move/from16 v1, v21

    :goto_14
    if-eqz v32, :cond_1d

    const/high16 v3, -0x80000000

    if-eq v12, v3, :cond_19

    if-nez v12, :cond_1d

    :cond_19
    const/4 v3, 0x0

    iput v3, v7, Landroid/support/v7/widget/aj;->f:I

    const/4 v3, 0x0

    :goto_15
    if-ge v3, v11, :cond_1d

    invoke-virtual {v7, v3}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v4

    if-nez v4, :cond_1a

    iget v4, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v7, v3}, Landroid/support/v7/widget/aj;->d(I)I

    move-result v5

    add-int/2addr v4, v5

    iput v4, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_16

    :cond_1a
    invoke-virtual {v4}, Landroid/view/View;->getVisibility()I

    move-result v5

    const/16 v6, 0x8

    if-ne v5, v6, :cond_1b

    invoke-virtual {v7, v4, v3}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v4

    add-int/2addr v3, v4

    :goto_16
    move/from16 v39, v1

    goto :goto_17

    :cond_1b
    invoke-virtual {v4}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v5

    check-cast v5, Landroid/support/v7/widget/aj$a;

    if-eqz v19, :cond_1c

    iget v6, v7, Landroid/support/v7/widget/aj;->f:I

    iget v9, v5, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v9, v14

    iget v5, v5, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v9, v5

    invoke-virtual {v7, v4}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v4

    add-int/2addr v9, v4

    add-int/2addr v6, v9

    iput v6, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_16

    :cond_1c
    iget v6, v7, Landroid/support/v7/widget/aj;->f:I

    add-int v9, v6, v14

    move/from16 v39, v1

    iget v1, v5, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v9, v1

    iget v1, v5, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v9, v1

    invoke-virtual {v7, v4}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v1

    add-int/2addr v9, v1

    invoke-static {v6, v9}, Ljava/lang/Math;->max(II)I

    move-result v1

    iput v1, v7, Landroid/support/v7/widget/aj;->f:I

    :goto_17
    add-int/lit8 v3, v3, 0x1

    move/from16 v1, v39

    goto :goto_15

    :cond_1d
    move/from16 v39, v1

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v3

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v4

    add-int/2addr v3, v4

    add-int/2addr v1, v3

    iput v1, v7, Landroid/support/v7/widget/aj;->f:I

    iget v1, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getSuggestedMinimumWidth()I

    move-result v3

    invoke-static {v1, v3}, Ljava/lang/Math;->max(II)I

    move-result v1

    const/4 v3, 0x0

    invoke-static {v1, v8, v3}, Landroid/view/View;->resolveSizeAndState(III)I

    move-result v1

    const v3, 0xffffff

    and-int/2addr v3, v1

    iget v4, v7, Landroid/support/v7/widget/aj;->f:I

    sub-int/2addr v3, v4

    if-nez v22, :cond_22

    if-eqz v3, :cond_1e

    cmpl-float v5, v0, v20

    if-lez v5, :cond_1e

    goto :goto_1a

    :cond_1e
    invoke-static {v2, v10}, Ljava/lang/Math;->max(II)I

    move-result v0

    if-eqz v32, :cond_21

    const/high16 v2, 0x40000000    # 2.0f

    if-eq v12, v2, :cond_21

    const/4 v2, 0x0

    :goto_18
    if-ge v2, v11, :cond_21

    invoke-virtual {v7, v2}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v3

    if-eqz v3, :cond_20

    invoke-virtual {v3}, Landroid/view/View;->getVisibility()I

    move-result v5

    const/16 v6, 0x8

    if-ne v5, v6, :cond_1f

    goto :goto_19

    :cond_1f
    invoke-virtual {v3}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v5

    check-cast v5, Landroid/support/v7/widget/aj$a;

    iget v5, v5, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v5, v5, v20

    if-lez v5, :cond_20

    const/high16 v5, 0x40000000    # 2.0f

    invoke-static {v14, v5}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v6

    invoke-virtual {v3}, Landroid/view/View;->getMeasuredHeight()I

    move-result v9

    invoke-static {v9, v5}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v9

    invoke-virtual {v3, v6, v9}, Landroid/view/View;->measure(II)V

    :cond_20
    :goto_19
    add-int/lit8 v2, v2, 0x1

    goto :goto_18

    :cond_21
    move/from16 v42, v11

    move/from16 v3, p2

    goto/16 :goto_2a

    :cond_22
    :goto_1a
    iget v5, v7, Landroid/support/v7/widget/aj;->g:F

    cmpl-float v5, v5, v20

    if-lez v5, :cond_23

    iget v0, v7, Landroid/support/v7/widget/aj;->g:F

    :cond_23
    const/4 v5, -0x1

    aput v5, v15, v16

    aput v5, v15, v17

    aput v5, v15, v18

    const/4 v6, 0x0

    aput v5, v15, v6

    aput v5, v29, v16

    aput v5, v29, v17

    aput v5, v29, v18

    aput v5, v29, v6

    iput v6, v7, Landroid/support/v7/widget/aj;->f:I

    move v10, v2

    move/from16 v9, v38

    const/4 v6, -0x1

    move v2, v0

    const/4 v0, 0x0

    :goto_1b
    if-ge v0, v11, :cond_32

    invoke-virtual {v7, v0}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v14

    if-eqz v14, :cond_31

    invoke-virtual {v14}, Landroid/view/View;->getVisibility()I

    move-result v5

    const/16 v4, 0x8

    if-ne v5, v4, :cond_24

    goto/16 :goto_26

    :cond_24
    invoke-virtual {v14}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v5

    check-cast v5, Landroid/support/v7/widget/aj$a;

    iget v4, v5, Landroid/support/v7/widget/aj$a;->g:F

    cmpl-float v21, v4, v20

    if-lez v21, :cond_29

    int-to-float v8, v3

    mul-float v8, v8, v4

    div-float/2addr v8, v2

    float-to-int v8, v8

    sub-float/2addr v2, v4

    sub-int/2addr v3, v8

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v4

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v21

    add-int v4, v4, v21

    move/from16 v40, v2

    iget v2, v5, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int/2addr v4, v2

    iget v2, v5, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v4, v2

    iget v2, v5, Landroid/support/v7/widget/aj$a;->height:I

    move/from16 v41, v3

    move/from16 v42, v11

    move/from16 v3, p2

    const/4 v11, -0x1

    invoke-static {v3, v4, v2}, Landroid/support/v7/widget/aj;->getChildMeasureSpec(III)I

    move-result v2

    iget v4, v5, Landroid/support/v7/widget/aj$a;->width:I

    if-nez v4, :cond_26

    const/high16 v4, 0x40000000    # 2.0f

    if-eq v12, v4, :cond_25

    goto :goto_1c

    :cond_25
    if-lez v8, :cond_27

    goto :goto_1d

    :cond_26
    const/high16 v4, 0x40000000    # 2.0f

    :goto_1c
    invoke-virtual {v14}, Landroid/view/View;->getMeasuredWidth()I

    move-result v21

    add-int v8, v21, v8

    if-gez v8, :cond_28

    :cond_27
    const/4 v8, 0x0

    :cond_28
    :goto_1d
    invoke-static {v8, v4}, Landroid/view/View$MeasureSpec;->makeMeasureSpec(II)I

    move-result v8

    invoke-virtual {v14, v8, v2}, Landroid/view/View;->measure(II)V

    invoke-virtual {v14}, Landroid/view/View;->getMeasuredState()I

    move-result v2

    const/high16 v4, -0x1000000

    and-int/2addr v2, v4

    invoke-static {v9, v2}, Landroid/view/View;->combineMeasuredStates(II)I

    move-result v9

    move/from16 v2, v40

    move/from16 v4, v41

    goto :goto_1e

    :cond_29
    move v4, v3

    move/from16 v42, v11

    move/from16 v3, p2

    const/4 v11, -0x1

    :goto_1e
    if-eqz v19, :cond_2a

    iget v8, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v14}, Landroid/view/View;->getMeasuredWidth()I

    move-result v21

    iget v11, v5, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int v21, v21, v11

    iget v11, v5, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int v21, v21, v11

    invoke-virtual {v7, v14}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v11

    add-int v21, v21, v11

    add-int v8, v8, v21

    iput v8, v7, Landroid/support/v7/widget/aj;->f:I

    move/from16 v43, v2

    :goto_1f
    const/high16 v2, 0x40000000    # 2.0f

    goto :goto_20

    :cond_2a
    iget v8, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual {v14}, Landroid/view/View;->getMeasuredWidth()I

    move-result v11

    add-int/2addr v11, v8

    move/from16 v43, v2

    iget v2, v5, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v11, v2

    iget v2, v5, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v11, v2

    invoke-virtual {v7, v14}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v2

    add-int/2addr v11, v2

    invoke-static {v8, v11}, Ljava/lang/Math;->max(II)I

    move-result v2

    iput v2, v7, Landroid/support/v7/widget/aj;->f:I

    goto :goto_1f

    :goto_20
    if-eq v13, v2, :cond_2b

    iget v2, v5, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v8, -0x1

    if-ne v2, v8, :cond_2b

    const/4 v2, 0x1

    goto :goto_21

    :cond_2b
    const/4 v2, 0x0

    :goto_21
    iget v8, v5, Landroid/support/v7/widget/aj$a;->topMargin:I

    iget v11, v5, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    add-int/2addr v8, v11

    invoke-virtual {v14}, Landroid/view/View;->getMeasuredHeight()I

    move-result v11

    add-int/2addr v11, v8

    invoke-static {v6, v11}, Ljava/lang/Math;->max(II)I

    move-result v6

    if-eqz v2, :cond_2c

    goto :goto_22

    :cond_2c
    move v8, v11

    :goto_22
    invoke-static {v10, v8}, Ljava/lang/Math;->max(II)I

    move-result v2

    if-eqz v27, :cond_2d

    iget v8, v5, Landroid/support/v7/widget/aj$a;->height:I

    const/4 v10, -0x1

    if-ne v8, v10, :cond_2e

    const/4 v8, 0x1

    goto :goto_23

    :cond_2d
    const/4 v10, -0x1

    :cond_2e
    const/4 v8, 0x0

    :goto_23
    if-eqz v36, :cond_30

    invoke-virtual {v14}, Landroid/view/View;->getBaseline()I

    move-result v14

    if-eq v14, v10, :cond_30

    iget v10, v5, Landroid/support/v7/widget/aj$a;->h:I

    if-gez v10, :cond_2f

    iget v5, v7, Landroid/support/v7/widget/aj;->e:I

    goto :goto_24

    :cond_2f
    iget v5, v5, Landroid/support/v7/widget/aj$a;->h:I

    :goto_24
    and-int/lit8 v5, v5, 0x70

    const/16 v21, 0x4

    shr-int/lit8 v5, v5, 0x4

    and-int/lit8 v5, v5, -0x2

    shr-int/lit8 v5, v5, 0x1

    aget v10, v15, v5

    invoke-static {v10, v14}, Ljava/lang/Math;->max(II)I

    move-result v10

    aput v10, v15, v5

    aget v10, v29, v5

    sub-int/2addr v11, v14

    invoke-static {v10, v11}, Ljava/lang/Math;->max(II)I

    move-result v10

    aput v10, v29, v5

    goto :goto_25

    :cond_30
    const/16 v21, 0x4

    :goto_25
    move v10, v2

    move/from16 v27, v8

    move/from16 v2, v43

    goto :goto_27

    :cond_31
    :goto_26
    move v4, v3

    move/from16 v42, v11

    move/from16 v3, p2

    const/16 v21, 0x4

    :goto_27
    add-int/lit8 v0, v0, 0x1

    move v3, v4

    move/from16 v11, v42

    const/4 v5, -0x1

    move/from16 v8, p1

    goto/16 :goto_1b

    :cond_32
    move/from16 v42, v11

    move/from16 v3, p2

    iget v0, v7, Landroid/support/v7/widget/aj;->f:I

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v2

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v4

    add-int/2addr v2, v4

    add-int/2addr v0, v2

    iput v0, v7, Landroid/support/v7/widget/aj;->f:I

    aget v0, v15, v18

    const/4 v2, -0x1

    if-ne v0, v2, :cond_34

    const/4 v0, 0x0

    aget v4, v15, v0

    if-ne v4, v2, :cond_34

    aget v0, v15, v17

    if-ne v0, v2, :cond_34

    aget v0, v15, v16

    if-eq v0, v2, :cond_33

    goto :goto_28

    :cond_33
    move v0, v6

    goto :goto_29

    :cond_34
    :goto_28
    aget v0, v15, v16

    const/4 v2, 0x0

    aget v4, v15, v2

    aget v5, v15, v18

    aget v8, v15, v17

    invoke-static {v5, v8}, Ljava/lang/Math;->max(II)I

    move-result v5

    invoke-static {v4, v5}, Ljava/lang/Math;->max(II)I

    move-result v4

    invoke-static {v0, v4}, Ljava/lang/Math;->max(II)I

    move-result v0

    aget v4, v29, v16

    aget v2, v29, v2

    aget v5, v29, v18

    aget v8, v29, v17

    invoke-static {v5, v8}, Ljava/lang/Math;->max(II)I

    move-result v5

    invoke-static {v2, v5}, Ljava/lang/Math;->max(II)I

    move-result v2

    invoke-static {v4, v2}, Ljava/lang/Math;->max(II)I

    move-result v2

    add-int/2addr v0, v2

    invoke-static {v6, v0}, Ljava/lang/Math;->max(II)I

    move-result v0

    :goto_29
    move/from16 v39, v0

    move/from16 v38, v9

    move v0, v10

    :goto_2a
    if-nez v27, :cond_35

    const/high16 v2, 0x40000000    # 2.0f

    if-eq v13, v2, :cond_35

    move/from16 v39, v0

    :cond_35
    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v0

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v2

    add-int/2addr v0, v2

    add-int v0, v39, v0

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getSuggestedMinimumHeight()I

    move-result v2

    invoke-static {v0, v2}, Ljava/lang/Math;->max(II)I

    move-result v0

    const/high16 v2, -0x1000000

    and-int v2, v38, v2

    or-int/2addr v1, v2

    shl-int/lit8 v2, v38, 0x10

    invoke-static {v0, v3, v2}, Landroid/view/View;->resolveSizeAndState(III)I

    move-result v0

    invoke-virtual {v7, v1, v0}, Landroid/support/v7/widget/aj;->setMeasuredDimension(II)V

    if-eqz v28, :cond_36

    move/from16 v1, v42

    move/from16 v0, p1

    invoke-direct {v7, v1, v0}, Landroid/support/v7/widget/aj;->d(II)V

    :cond_36
    return-void
.end method

.method b(IIII)V
    .locals 27

    move-object/from16 v6, p0

    invoke-static/range {p0 .. p0}, Landroid/support/v7/widget/bc;->a(Landroid/view/View;)Z

    move-result v2

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v7

    sub-int v3, p4, p2

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v4

    sub-int v8, v3, v4

    sub-int/2addr v3, v7

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v4

    sub-int v9, v3, v4

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getVirtualChildCount()I

    move-result v10

    iget v3, v6, Landroid/support/v7/widget/aj;->e:I

    const v4, 0x800007

    and-int/2addr v3, v4

    iget v4, v6, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v11, v4, 0x70

    iget-boolean v12, v6, Landroid/support/v7/widget/aj;->a:Z

    iget-object v13, v6, Landroid/support/v7/widget/aj;->i:[I

    iget-object v14, v6, Landroid/support/v7/widget/aj;->j:[I

    invoke-static/range {p0 .. p0}, Landroid/support/v4/g/p;->b(Landroid/view/View;)I

    move-result v4

    invoke-static {v3, v4}, Landroid/support/v4/g/d;->a(II)I

    move-result v3

    const/4 v15, 0x2

    const/4 v5, 0x1

    if-eq v3, v5, :cond_1

    const/4 v4, 0x5

    if-eq v3, v4, :cond_0

    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v0

    goto :goto_0

    :cond_0
    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v3

    add-int v3, v3, p3

    sub-int v3, v3, p1

    iget v0, v6, Landroid/support/v7/widget/aj;->f:I

    sub-int v0, v3, v0

    goto :goto_0

    :cond_1
    invoke-virtual/range {p0 .. p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v3

    sub-int v0, p3, p1

    iget v1, v6, Landroid/support/v7/widget/aj;->f:I

    sub-int/2addr v0, v1

    div-int/2addr v0, v15

    add-int/2addr v0, v3

    :goto_0
    const/4 v1, 0x0

    if-eqz v2, :cond_2

    add-int/lit8 v2, v10, -0x1

    move/from16 v16, v2

    const/16 v17, -0x1

    goto :goto_1

    :cond_2
    const/16 v16, 0x0

    const/16 v17, 0x1

    :goto_1
    const/4 v3, 0x0

    :goto_2
    if-ge v3, v10, :cond_e

    mul-int v1, v17, v3

    add-int v2, v16, v1

    invoke-virtual {v6, v2}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v1

    if-nez v1, :cond_3

    invoke-virtual {v6, v2}, Landroid/support/v7/widget/aj;->d(I)I

    move-result v1

    add-int/2addr v0, v1

    :goto_3
    move/from16 v26, v7

    move/from16 v23, v10

    move/from16 v24, v11

    const/16 v18, 0x1

    const/16 v20, -0x1

    goto/16 :goto_8

    :cond_3
    invoke-virtual {v1}, Landroid/view/View;->getVisibility()I

    move-result v5

    const/16 v15, 0x8

    if-eq v5, v15, :cond_d

    invoke-virtual {v1}, Landroid/view/View;->getMeasuredWidth()I

    move-result v15

    invoke-virtual {v1}, Landroid/view/View;->getMeasuredHeight()I

    move-result v5

    invoke-virtual {v1}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v20

    move-object/from16 v4, v20

    check-cast v4, Landroid/support/v7/widget/aj$a;

    if-eqz v12, :cond_4

    move/from16 v22, v3

    iget v3, v4, Landroid/support/v7/widget/aj$a;->height:I

    move/from16 v23, v10

    const/4 v10, -0x1

    if-eq v3, v10, :cond_5

    invoke-virtual {v1}, Landroid/view/View;->getBaseline()I

    move-result v3

    goto :goto_4

    :cond_4
    move/from16 v22, v3

    move/from16 v23, v10

    :cond_5
    const/4 v3, -0x1

    :goto_4
    iget v10, v4, Landroid/support/v7/widget/aj$a;->h:I

    if-gez v10, :cond_6

    move v10, v11

    :cond_6
    and-int/lit8 v10, v10, 0x70

    move/from16 v24, v11

    const/16 v11, 0x10

    if-eq v10, v11, :cond_b

    const/16 v11, 0x30

    if-eq v10, v11, :cond_9

    const/16 v11, 0x50

    if-eq v10, v11, :cond_7

    move v3, v7

    const/4 v11, -0x1

    :goto_5
    const/16 v18, 0x1

    goto :goto_7

    :cond_7
    sub-int v10, v8, v5

    iget v11, v4, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    sub-int/2addr v10, v11

    const/4 v11, -0x1

    if-eq v3, v11, :cond_8

    invoke-virtual {v1}, Landroid/view/View;->getMeasuredHeight()I

    move-result v20

    sub-int v20, v20, v3

    const/4 v3, 0x2

    aget v21, v14, v3

    sub-int v21, v21, v20

    sub-int v10, v10, v21

    :cond_8
    move v3, v10

    goto :goto_5

    :cond_9
    const/4 v11, -0x1

    iget v10, v4, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int/2addr v10, v7

    if-eq v3, v11, :cond_a

    const/16 v18, 0x1

    aget v20, v13, v18

    sub-int v20, v20, v3

    add-int v10, v10, v20

    goto :goto_6

    :cond_a
    const/16 v18, 0x1

    :goto_6
    move v3, v10

    goto :goto_7

    :cond_b
    const/4 v11, -0x1

    const/16 v18, 0x1

    sub-int v3, v9, v5

    const/4 v10, 0x2

    div-int/2addr v3, v10

    add-int/2addr v3, v7

    iget v10, v4, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int/2addr v3, v10

    iget v10, v4, Landroid/support/v7/widget/aj$a;->bottomMargin:I

    sub-int/2addr v3, v10

    :goto_7
    invoke-virtual {v6, v2}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v10

    if-eqz v10, :cond_c

    iget v10, v6, Landroid/support/v7/widget/aj;->l:I

    add-int/2addr v0, v10

    :cond_c
    iget v10, v4, Landroid/support/v7/widget/aj$a;->leftMargin:I

    add-int/2addr v10, v0

    invoke-virtual {v6, v1}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;)I

    move-result v0

    add-int v19, v10, v0

    move-object/from16 v0, p0

    move-object/from16 v25, v1

    move v11, v2

    move/from16 v2, v19

    move/from16 v19, v22

    move/from16 v26, v7

    const/16 v20, -0x1

    move-object v7, v4

    move v4, v15

    invoke-direct/range {v0 .. v5}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;IIII)V

    iget v0, v7, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v15, v0

    move-object/from16 v0, v25

    invoke-virtual {v6, v0}, Landroid/support/v7/widget/aj;->b(Landroid/view/View;)I

    move-result v1

    add-int/2addr v15, v1

    add-int/2addr v10, v15

    invoke-virtual {v6, v0, v11}, Landroid/support/v7/widget/aj;->a(Landroid/view/View;I)I

    move-result v0

    add-int v3, v19, v0

    move v0, v10

    goto :goto_8

    :cond_d
    move/from16 v19, v3

    goto/16 :goto_3

    :goto_8
    add-int/lit8 v3, v3, 0x1

    move/from16 v10, v23

    move/from16 v11, v24

    move/from16 v7, v26

    const/4 v5, 0x1

    const/4 v15, 0x2

    goto/16 :goto_2

    :cond_e
    return-void
.end method

.method b(Landroid/graphics/Canvas;)V
    .locals 6

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getVirtualChildCount()I

    move-result v0

    invoke-static {p0}, Landroid/support/v7/widget/bc;->a(Landroid/view/View;)Z

    move-result v1

    const/4 v2, 0x0

    :goto_0
    if-ge v2, v0, :cond_2

    invoke-virtual {p0, v2}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v3

    if-eqz v3, :cond_1

    invoke-virtual {v3}, Landroid/view/View;->getVisibility()I

    move-result v4

    const/16 v5, 0x8

    if-eq v4, v5, :cond_1

    invoke-virtual {p0, v2}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v4

    if-eqz v4, :cond_1

    invoke-virtual {v3}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v4

    check-cast v4, Landroid/support/v7/widget/aj$a;

    if-eqz v1, :cond_0

    invoke-virtual {v3}, Landroid/view/View;->getRight()I

    move-result v3

    iget v4, v4, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v3, v4

    goto :goto_1

    :cond_0
    invoke-virtual {v3}, Landroid/view/View;->getLeft()I

    move-result v3

    iget v4, v4, Landroid/support/v7/widget/aj$a;->leftMargin:I

    sub-int/2addr v3, v4

    iget v4, p0, Landroid/support/v7/widget/aj;->l:I

    sub-int/2addr v3, v4

    :goto_1
    invoke-virtual {p0, p1, v3}, Landroid/support/v7/widget/aj;->b(Landroid/graphics/Canvas;I)V

    :cond_1
    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    :cond_2
    invoke-virtual {p0, v0}, Landroid/support/v7/widget/aj;->c(I)Z

    move-result v2

    if-eqz v2, :cond_6

    add-int/lit8 v0, v0, -0x1

    invoke-virtual {p0, v0}, Landroid/support/v7/widget/aj;->b(I)Landroid/view/View;

    move-result-object v0

    if-nez v0, :cond_4

    if-eqz v1, :cond_3

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingLeft()I

    move-result v0

    goto :goto_3

    :cond_3
    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getWidth()I

    move-result v0

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingRight()I

    move-result v1

    :goto_2
    sub-int/2addr v0, v1

    iget v1, p0, Landroid/support/v7/widget/aj;->l:I

    sub-int/2addr v0, v1

    goto :goto_3

    :cond_4
    invoke-virtual {v0}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v2

    check-cast v2, Landroid/support/v7/widget/aj$a;

    if-eqz v1, :cond_5

    invoke-virtual {v0}, Landroid/view/View;->getLeft()I

    move-result v0

    iget v1, v2, Landroid/support/v7/widget/aj$a;->leftMargin:I

    goto :goto_2

    :cond_5
    invoke-virtual {v0}, Landroid/view/View;->getRight()I

    move-result v0

    iget v1, v2, Landroid/support/v7/widget/aj$a;->rightMargin:I

    add-int/2addr v0, v1

    :goto_3
    invoke-virtual {p0, p1, v0}, Landroid/support/v7/widget/aj;->b(Landroid/graphics/Canvas;I)V

    :cond_6
    return-void
.end method

.method b(Landroid/graphics/Canvas;I)V
    .locals 5

    iget-object v0, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v1

    iget v2, p0, Landroid/support/v7/widget/aj;->o:I

    add-int/2addr v1, v2

    iget v2, p0, Landroid/support/v7/widget/aj;->l:I

    add-int/2addr v2, p2

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getHeight()I

    move-result v3

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v4

    sub-int/2addr v3, v4

    iget v4, p0, Landroid/support/v7/widget/aj;->o:I

    sub-int/2addr v3, v4

    invoke-virtual {v0, p2, v1, v2, v3}, Landroid/graphics/drawable/Drawable;->setBounds(IIII)V

    iget-object p2, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    invoke-virtual {p2, p1}, Landroid/graphics/drawable/Drawable;->draw(Landroid/graphics/Canvas;)V

    return-void
.end method

.method protected c(I)Z
    .locals 4

    const/4 v0, 0x0

    const/4 v1, 0x1

    if-nez p1, :cond_1

    iget p1, p0, Landroid/support/v7/widget/aj;->n:I

    and-int/2addr p1, v1

    if-eqz p1, :cond_0

    const/4 v0, 0x1

    :cond_0
    return v0

    :cond_1
    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getChildCount()I

    move-result v2

    if-ne p1, v2, :cond_3

    iget p1, p0, Landroid/support/v7/widget/aj;->n:I

    and-int/lit8 p1, p1, 0x4

    if-eqz p1, :cond_2

    const/4 v0, 0x1

    :cond_2
    return v0

    :cond_3
    iget v2, p0, Landroid/support/v7/widget/aj;->n:I

    and-int/lit8 v2, v2, 0x2

    if-eqz v2, :cond_5

    sub-int/2addr p1, v1

    :goto_0
    if-ltz p1, :cond_5

    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->getChildAt(I)Landroid/view/View;

    move-result-object v2

    invoke-virtual {v2}, Landroid/view/View;->getVisibility()I

    move-result v2

    const/16 v3, 0x8

    if-eq v2, v3, :cond_4

    const/4 v0, 0x1

    goto :goto_1

    :cond_4
    add-int/lit8 p1, p1, -0x1

    goto :goto_0

    :cond_5
    :goto_1
    return v0
.end method

.method protected checkLayoutParams(Landroid/view/ViewGroup$LayoutParams;)Z
    .locals 0

    instance-of p1, p1, Landroid/support/v7/widget/aj$a;

    return p1
.end method

.method d(I)I
    .locals 0

    const/4 p1, 0x0

    return p1
.end method

.method protected synthetic generateDefaultLayoutParams()Landroid/view/ViewGroup$LayoutParams;
    .locals 1

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->j()Landroid/support/v7/widget/aj$a;

    move-result-object v0

    return-object v0
.end method

.method public synthetic generateLayoutParams(Landroid/util/AttributeSet;)Landroid/view/ViewGroup$LayoutParams;
    .locals 0

    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->b(Landroid/util/AttributeSet;)Landroid/support/v7/widget/aj$a;

    move-result-object p1

    return-object p1
.end method

.method protected synthetic generateLayoutParams(Landroid/view/ViewGroup$LayoutParams;)Landroid/view/ViewGroup$LayoutParams;
    .locals 0

    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->b(Landroid/view/ViewGroup$LayoutParams;)Landroid/support/v7/widget/aj$a;

    move-result-object p1

    return-object p1
.end method

.method public getBaseline()I
    .locals 5

    iget v0, p0, Landroid/support/v7/widget/aj;->b:I

    if-gez v0, :cond_0

    invoke-super {p0}, Landroid/view/ViewGroup;->getBaseline()I

    move-result v0

    return v0

    :cond_0
    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getChildCount()I

    move-result v0

    iget v1, p0, Landroid/support/v7/widget/aj;->b:I

    if-le v0, v1, :cond_6

    iget v0, p0, Landroid/support/v7/widget/aj;->b:I

    invoke-virtual {p0, v0}, Landroid/support/v7/widget/aj;->getChildAt(I)Landroid/view/View;

    move-result-object v0

    invoke-virtual {v0}, Landroid/view/View;->getBaseline()I

    move-result v1

    const/4 v2, -0x1

    if-ne v1, v2, :cond_2

    iget v0, p0, Landroid/support/v7/widget/aj;->b:I

    if-nez v0, :cond_1

    return v2

    :cond_1
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "mBaselineAlignedChildIndex of LinearLayout points to a View that doesn\'t know how to get its baseline."

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0

    :cond_2
    iget v2, p0, Landroid/support/v7/widget/aj;->c:I

    iget v3, p0, Landroid/support/v7/widget/aj;->d:I

    const/4 v4, 0x1

    if-ne v3, v4, :cond_5

    iget v3, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v3, v3, 0x70

    const/16 v4, 0x30

    if-eq v3, v4, :cond_5

    const/16 v4, 0x10

    if-eq v3, v4, :cond_4

    const/16 v4, 0x50

    if-eq v3, v4, :cond_3

    goto :goto_0

    :cond_3
    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getBottom()I

    move-result v2

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getTop()I

    move-result v3

    sub-int/2addr v2, v3

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v3

    sub-int/2addr v2, v3

    iget v3, p0, Landroid/support/v7/widget/aj;->f:I

    sub-int/2addr v2, v3

    goto :goto_0

    :cond_4
    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getBottom()I

    move-result v3

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getTop()I

    move-result v4

    sub-int/2addr v3, v4

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingTop()I

    move-result v4

    sub-int/2addr v3, v4

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getPaddingBottom()I

    move-result v4

    sub-int/2addr v3, v4

    iget v4, p0, Landroid/support/v7/widget/aj;->f:I

    sub-int/2addr v3, v4

    div-int/lit8 v3, v3, 0x2

    add-int/2addr v2, v3

    :cond_5
    :goto_0
    invoke-virtual {v0}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v0

    check-cast v0, Landroid/support/v7/widget/aj$a;

    iget v0, v0, Landroid/support/v7/widget/aj$a;->topMargin:I

    add-int/2addr v2, v0

    add-int/2addr v2, v1

    return v2

    :cond_6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "mBaselineAlignedChildIndex of LinearLayout set to an index that is out of bounds."

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public getBaselineAlignedChildIndex()I
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->b:I

    return v0
.end method

.method public getDividerDrawable()Landroid/graphics/drawable/Drawable;
    .locals 1

    iget-object v0, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    return-object v0
.end method

.method public getDividerPadding()I
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->o:I

    return v0
.end method

.method public getDividerWidth()I
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->l:I

    return v0
.end method

.method public getGravity()I
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    return v0
.end method

.method public getOrientation()I
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->d:I

    return v0
.end method

.method public getShowDividers()I
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->n:I

    return v0
.end method

.method getVirtualChildCount()I
    .locals 1

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getChildCount()I

    move-result v0

    return v0
.end method

.method public getWeightSum()F
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->g:F

    return v0
.end method

.method protected j()Landroid/support/v7/widget/aj$a;
    .locals 3

    iget v0, p0, Landroid/support/v7/widget/aj;->d:I

    const/4 v1, -0x2

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v7/widget/aj$a;

    invoke-direct {v0, v1, v1}, Landroid/support/v7/widget/aj$a;-><init>(II)V

    return-object v0

    :cond_0
    iget v0, p0, Landroid/support/v7/widget/aj;->d:I

    const/4 v2, 0x1

    if-ne v0, v2, :cond_1

    new-instance v0, Landroid/support/v7/widget/aj$a;

    const/4 v2, -0x1

    invoke-direct {v0, v2, v1}, Landroid/support/v7/widget/aj$a;-><init>(II)V

    return-object v0

    :cond_1
    const/4 v0, 0x0

    return-object v0
.end method

.method protected onDraw(Landroid/graphics/Canvas;)V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    if-nez v0, :cond_0

    return-void

    :cond_0
    iget v0, p0, Landroid/support/v7/widget/aj;->d:I

    const/4 v1, 0x1

    if-ne v0, v1, :cond_1

    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->a(Landroid/graphics/Canvas;)V

    goto :goto_0

    :cond_1
    invoke-virtual {p0, p1}, Landroid/support/v7/widget/aj;->b(Landroid/graphics/Canvas;)V

    :goto_0
    return-void
.end method

.method public onInitializeAccessibilityEvent(Landroid/view/accessibility/AccessibilityEvent;)V
    .locals 1

    invoke-super {p0, p1}, Landroid/view/ViewGroup;->onInitializeAccessibilityEvent(Landroid/view/accessibility/AccessibilityEvent;)V

    const-class v0, Landroid/support/v7/widget/aj;

    invoke-virtual {v0}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Landroid/view/accessibility/AccessibilityEvent;->setClassName(Ljava/lang/CharSequence;)V

    return-void
.end method

.method public onInitializeAccessibilityNodeInfo(Landroid/view/accessibility/AccessibilityNodeInfo;)V
    .locals 1

    invoke-super {p0, p1}, Landroid/view/ViewGroup;->onInitializeAccessibilityNodeInfo(Landroid/view/accessibility/AccessibilityNodeInfo;)V

    const-class v0, Landroid/support/v7/widget/aj;

    invoke-virtual {v0}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Landroid/view/accessibility/AccessibilityNodeInfo;->setClassName(Ljava/lang/CharSequence;)V

    return-void
.end method

.method protected onLayout(ZIIII)V
    .locals 1

    iget p1, p0, Landroid/support/v7/widget/aj;->d:I

    const/4 v0, 0x1

    if-ne p1, v0, :cond_0

    invoke-virtual {p0, p2, p3, p4, p5}, Landroid/support/v7/widget/aj;->a(IIII)V

    goto :goto_0

    :cond_0
    invoke-virtual {p0, p2, p3, p4, p5}, Landroid/support/v7/widget/aj;->b(IIII)V

    :goto_0
    return-void
.end method

.method protected onMeasure(II)V
    .locals 2

    iget v0, p0, Landroid/support/v7/widget/aj;->d:I

    const/4 v1, 0x1

    if-ne v0, v1, :cond_0

    invoke-virtual {p0, p1, p2}, Landroid/support/v7/widget/aj;->a(II)V

    goto :goto_0

    :cond_0
    invoke-virtual {p0, p1, p2}, Landroid/support/v7/widget/aj;->b(II)V

    :goto_0
    return-void
.end method

.method public setBaselineAligned(Z)V
    .locals 0

    iput-boolean p1, p0, Landroid/support/v7/widget/aj;->a:Z

    return-void
.end method

.method public setBaselineAlignedChildIndex(I)V
    .locals 2

    if-ltz p1, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getChildCount()I

    move-result v0

    if-ge p1, v0, :cond_0

    iput p1, p0, Landroid/support/v7/widget/aj;->b:I

    return-void

    :cond_0
    new-instance p1, Ljava/lang/IllegalArgumentException;

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "base aligned child index out of range (0, "

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->getChildCount()I

    move-result v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    const-string v1, ")"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-direct {p1, v0}, Ljava/lang/IllegalArgumentException;-><init>(Ljava/lang/String;)V

    throw p1
.end method

.method public setDividerDrawable(Landroid/graphics/drawable/Drawable;)V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    if-ne p1, v0, :cond_0

    return-void

    :cond_0
    iput-object p1, p0, Landroid/support/v7/widget/aj;->k:Landroid/graphics/drawable/Drawable;

    const/4 v0, 0x0

    if-eqz p1, :cond_1

    invoke-virtual {p1}, Landroid/graphics/drawable/Drawable;->getIntrinsicWidth()I

    move-result v1

    iput v1, p0, Landroid/support/v7/widget/aj;->l:I

    invoke-virtual {p1}, Landroid/graphics/drawable/Drawable;->getIntrinsicHeight()I

    move-result v1

    iput v1, p0, Landroid/support/v7/widget/aj;->m:I

    goto :goto_0

    :cond_1
    iput v0, p0, Landroid/support/v7/widget/aj;->l:I

    iput v0, p0, Landroid/support/v7/widget/aj;->m:I

    :goto_0
    if-nez p1, :cond_2

    const/4 v0, 0x1

    :cond_2
    invoke-virtual {p0, v0}, Landroid/support/v7/widget/aj;->setWillNotDraw(Z)V

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->requestLayout()V

    return-void
.end method

.method public setDividerPadding(I)V
    .locals 0

    iput p1, p0, Landroid/support/v7/widget/aj;->o:I

    return-void
.end method

.method public setGravity(I)V
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    if-eq v0, p1, :cond_2

    const v0, 0x800007

    and-int/2addr v0, p1

    if-nez v0, :cond_0

    const v0, 0x800003

    or-int/2addr p1, v0

    :cond_0
    and-int/lit8 v0, p1, 0x70

    if-nez v0, :cond_1

    or-int/lit8 p1, p1, 0x30

    :cond_1
    iput p1, p0, Landroid/support/v7/widget/aj;->e:I

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->requestLayout()V

    :cond_2
    return-void
.end method

.method public setHorizontalGravity(I)V
    .locals 2

    const v0, 0x800007

    and-int/2addr p1, v0

    iget v1, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/2addr v0, v1

    if-eq v0, p1, :cond_0

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    const v1, -0x800008

    and-int/2addr v0, v1

    or-int/2addr p1, v0

    iput p1, p0, Landroid/support/v7/widget/aj;->e:I

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->requestLayout()V

    :cond_0
    return-void
.end method

.method public setMeasureWithLargestChildEnabled(Z)V
    .locals 0

    iput-boolean p1, p0, Landroid/support/v7/widget/aj;->h:Z

    return-void
.end method

.method public setOrientation(I)V
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->d:I

    if-eq v0, p1, :cond_0

    iput p1, p0, Landroid/support/v7/widget/aj;->d:I

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->requestLayout()V

    :cond_0
    return-void
.end method

.method public setShowDividers(I)V
    .locals 1

    iget v0, p0, Landroid/support/v7/widget/aj;->n:I

    if-eq p1, v0, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->requestLayout()V

    :cond_0
    iput p1, p0, Landroid/support/v7/widget/aj;->n:I

    return-void
.end method

.method public setVerticalGravity(I)V
    .locals 1

    and-int/lit8 p1, p1, 0x70

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v0, v0, 0x70

    if-eq v0, p1, :cond_0

    iget v0, p0, Landroid/support/v7/widget/aj;->e:I

    and-int/lit8 v0, v0, -0x71

    or-int/2addr p1, v0

    iput p1, p0, Landroid/support/v7/widget/aj;->e:I

    invoke-virtual {p0}, Landroid/support/v7/widget/aj;->requestLayout()V

    :cond_0
    return-void
.end method

.method public setWeightSum(F)V
    .locals 1

    const/4 v0, 0x0

    invoke-static {v0, p1}, Ljava/lang/Math;->max(FF)F

    move-result p1

    iput p1, p0, Landroid/support/v7/widget/aj;->g:F

    return-void
.end method

.method public shouldDelayChildPressedState()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method
