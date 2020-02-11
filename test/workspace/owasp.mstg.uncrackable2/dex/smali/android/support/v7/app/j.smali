.class Landroid/support/v7/app/j;
.super Landroid/support/v7/app/f;

# interfaces
.implements Landroid/support/v7/view/menu/h$a;
.implements Landroid/view/LayoutInflater$Factory2;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/support/v7/app/j$c;,
        Landroid/support/v7/app/j$d;,
        Landroid/support/v7/app/j$a;,
        Landroid/support/v7/app/j$e;,
        Landroid/support/v7/app/j$b;
    }
.end annotation


# static fields
.field private static final t:Z


# instance fields
.field private A:Landroid/view/View;

.field private B:Z

.field private C:Z

.field private D:Z

.field private E:[Landroid/support/v7/app/j$d;

.field private F:Landroid/support/v7/app/j$d;

.field private G:Z

.field private final H:Ljava/lang/Runnable;

.field private I:Z

.field private J:Landroid/graphics/Rect;

.field private K:Landroid/graphics/Rect;

.field private L:Landroid/support/v7/app/AppCompatViewInflater;

.field m:Landroid/support/v7/view/b;

.field n:Landroid/support/v7/widget/ActionBarContextView;

.field o:Landroid/widget/PopupWindow;

.field p:Ljava/lang/Runnable;

.field q:Landroid/support/v4/g/s;

.field r:Z

.field s:I

.field private u:Landroid/support/v7/widget/ad;

.field private v:Landroid/support/v7/app/j$a;

.field private w:Landroid/support/v7/app/j$e;

.field private x:Z

.field private y:Landroid/view/ViewGroup;

.field private z:Landroid/widget/TextView;


# direct methods
.method static constructor <clinit>()V
    .locals 2

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x15

    if-ge v0, v1, :cond_0

    const/4 v0, 0x1

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    sput-boolean v0, Landroid/support/v7/app/j;->t:Z

    return-void
.end method

.method constructor <init>(Landroid/content/Context;Landroid/view/Window;Landroid/support/v7/app/d;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Landroid/support/v7/app/f;-><init>(Landroid/content/Context;Landroid/view/Window;Landroid/support/v7/app/d;)V

    const/4 p1, 0x0

    iput-object p1, p0, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    new-instance p1, Landroid/support/v7/app/j$1;

    invoke-direct {p1, p0}, Landroid/support/v7/app/j$1;-><init>(Landroid/support/v7/app/j;)V

    iput-object p1, p0, Landroid/support/v7/app/j;->H:Ljava/lang/Runnable;

    return-void
.end method

.method private a(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)V
    .locals 13

    iget-boolean v0, p1, Landroid/support/v7/app/j$d;->o:Z

    if-nez v0, :cond_f

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result v0

    if-eqz v0, :cond_0

    goto/16 :goto_3

    :cond_0
    iget v0, p1, Landroid/support/v7/app/j$d;->a:I

    const/4 v1, 0x0

    const/4 v2, 0x1

    if-nez v0, :cond_2

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-virtual {v0}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/res/Resources;->getConfiguration()Landroid/content/res/Configuration;

    move-result-object v0

    iget v0, v0, Landroid/content/res/Configuration;->screenLayout:I

    and-int/lit8 v0, v0, 0xf

    const/4 v3, 0x4

    if-ne v0, v3, :cond_1

    const/4 v0, 0x1

    goto :goto_0

    :cond_1
    const/4 v0, 0x0

    :goto_0
    if-eqz v0, :cond_2

    return-void

    :cond_2
    invoke-virtual {p0}, Landroid/support/v7/app/j;->q()Landroid/view/Window$Callback;

    move-result-object v0

    if-eqz v0, :cond_3

    iget v3, p1, Landroid/support/v7/app/j$d;->a:I

    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-interface {v0, v3, v4}, Landroid/view/Window$Callback;->onMenuOpened(ILandroid/view/Menu;)Z

    move-result v0

    if-nez v0, :cond_3

    invoke-virtual {p0, p1, v2}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    return-void

    :cond_3
    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    const-string v3, "window"

    invoke-virtual {v0, v3}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/view/WindowManager;

    if-nez v0, :cond_4

    return-void

    :cond_4
    invoke-direct {p0, p1, p2}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    move-result p2

    if-nez p2, :cond_5

    return-void

    :cond_5
    iget-object p2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    const/4 v3, -0x1

    const/4 v4, -0x2

    if-eqz p2, :cond_7

    iget-boolean p2, p1, Landroid/support/v7/app/j$d;->q:Z

    if-eqz p2, :cond_6

    goto :goto_1

    :cond_6
    iget-object p2, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    if-eqz p2, :cond_e

    iget-object p2, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    invoke-virtual {p2}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object p2

    if-eqz p2, :cond_e

    iget p2, p2, Landroid/view/ViewGroup$LayoutParams;->width:I

    if-ne p2, v3, :cond_e

    const/4 v6, -0x1

    goto :goto_2

    :cond_7
    :goto_1
    iget-object p2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    if-nez p2, :cond_9

    invoke-direct {p0, p1}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;)Z

    move-result p2

    if-eqz p2, :cond_8

    iget-object p2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    if-nez p2, :cond_a

    :cond_8
    return-void

    :cond_9
    iget-boolean p2, p1, Landroid/support/v7/app/j$d;->q:Z

    if-eqz p2, :cond_a

    iget-object p2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    invoke-virtual {p2}, Landroid/view/ViewGroup;->getChildCount()I

    move-result p2

    if-lez p2, :cond_a

    iget-object p2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    invoke-virtual {p2}, Landroid/view/ViewGroup;->removeAllViews()V

    :cond_a
    invoke-direct {p0, p1}, Landroid/support/v7/app/j;->c(Landroid/support/v7/app/j$d;)Z

    move-result p2

    if-eqz p2, :cond_f

    invoke-virtual {p1}, Landroid/support/v7/app/j$d;->a()Z

    move-result p2

    if-nez p2, :cond_b

    goto :goto_3

    :cond_b
    iget-object p2, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    invoke-virtual {p2}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object p2

    if-nez p2, :cond_c

    new-instance p2, Landroid/view/ViewGroup$LayoutParams;

    invoke-direct {p2, v4, v4}, Landroid/view/ViewGroup$LayoutParams;-><init>(II)V

    :cond_c
    iget v3, p1, Landroid/support/v7/app/j$d;->b:I

    iget-object v5, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    invoke-virtual {v5, v3}, Landroid/view/ViewGroup;->setBackgroundResource(I)V

    iget-object v3, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    invoke-virtual {v3}, Landroid/view/View;->getParent()Landroid/view/ViewParent;

    move-result-object v3

    if-eqz v3, :cond_d

    instance-of v5, v3, Landroid/view/ViewGroup;

    if-eqz v5, :cond_d

    check-cast v3, Landroid/view/ViewGroup;

    iget-object v5, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    invoke-virtual {v3, v5}, Landroid/view/ViewGroup;->removeView(Landroid/view/View;)V

    :cond_d
    iget-object v3, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    iget-object v5, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    invoke-virtual {v3, v5, p2}, Landroid/view/ViewGroup;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    iget-object p2, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    invoke-virtual {p2}, Landroid/view/View;->hasFocus()Z

    move-result p2

    if-nez p2, :cond_e

    iget-object p2, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    invoke-virtual {p2}, Landroid/view/View;->requestFocus()Z

    :cond_e
    const/4 v6, -0x2

    :goto_2
    iput-boolean v1, p1, Landroid/support/v7/app/j$d;->n:Z

    new-instance p2, Landroid/view/WindowManager$LayoutParams;

    const/4 v7, -0x2

    iget v8, p1, Landroid/support/v7/app/j$d;->d:I

    iget v9, p1, Landroid/support/v7/app/j$d;->e:I

    const/16 v10, 0x3ea

    const/high16 v11, 0x820000

    const/4 v12, -0x3

    move-object v5, p2

    invoke-direct/range {v5 .. v12}, Landroid/view/WindowManager$LayoutParams;-><init>(IIIIIII)V

    iget v1, p1, Landroid/support/v7/app/j$d;->c:I

    iput v1, p2, Landroid/view/WindowManager$LayoutParams;->gravity:I

    iget v1, p1, Landroid/support/v7/app/j$d;->f:I

    iput v1, p2, Landroid/view/WindowManager$LayoutParams;->windowAnimations:I

    iget-object v1, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    invoke-interface {v0, v1, p2}, Landroid/view/WindowManager;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    iput-boolean v2, p1, Landroid/support/v7/app/j$d;->o:Z

    :cond_f
    :goto_3
    return-void
.end method

.method private a(Landroid/support/v7/view/menu/h;Z)V
    .locals 4

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    const/4 v0, 0x1

    const/4 v1, 0x0

    if-eqz p1, :cond_5

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->e()Z

    move-result p1

    if-eqz p1, :cond_5

    iget-object p1, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-static {p1}, Landroid/view/ViewConfiguration;->get(Landroid/content/Context;)Landroid/view/ViewConfiguration;

    move-result-object p1

    invoke-virtual {p1}, Landroid/view/ViewConfiguration;->hasPermanentMenuKey()Z

    move-result p1

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->g()Z

    move-result p1

    if-eqz p1, :cond_5

    :cond_0
    invoke-virtual {p0}, Landroid/support/v7/app/j;->q()Landroid/view/Window$Callback;

    move-result-object p1

    iget-object v2, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v2}, Landroid/support/v7/widget/ad;->f()Z

    move-result v2

    const/16 v3, 0x6c

    if-eqz v2, :cond_2

    if-nez p2, :cond_1

    goto :goto_0

    :cond_1
    iget-object p2, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p2}, Landroid/support/v7/widget/ad;->i()Z

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result p2

    if-nez p2, :cond_4

    invoke-virtual {p0, v1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p2

    iget-object p2, p2, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-interface {p1, v3, p2}, Landroid/view/Window$Callback;->onPanelClosed(ILandroid/view/Menu;)V

    goto :goto_1

    :cond_2
    :goto_0
    if-eqz p1, :cond_4

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result p2

    if-nez p2, :cond_4

    iget-boolean p2, p0, Landroid/support/v7/app/j;->r:Z

    if-eqz p2, :cond_3

    iget p2, p0, Landroid/support/v7/app/j;->s:I

    and-int/2addr p2, v0

    if-eqz p2, :cond_3

    iget-object p2, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {p2}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object p2

    iget-object v2, p0, Landroid/support/v7/app/j;->H:Ljava/lang/Runnable;

    invoke-virtual {p2, v2}, Landroid/view/View;->removeCallbacks(Ljava/lang/Runnable;)Z

    iget-object p2, p0, Landroid/support/v7/app/j;->H:Ljava/lang/Runnable;

    invoke-interface {p2}, Ljava/lang/Runnable;->run()V

    :cond_3
    invoke-virtual {p0, v1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p2

    iget-object v0, p2, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-eqz v0, :cond_4

    iget-boolean v0, p2, Landroid/support/v7/app/j$d;->r:Z

    if-nez v0, :cond_4

    iget-object v0, p2, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    iget-object v2, p2, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-interface {p1, v1, v0, v2}, Landroid/view/Window$Callback;->onPreparePanel(ILandroid/view/View;Landroid/view/Menu;)Z

    move-result v0

    if-eqz v0, :cond_4

    iget-object p2, p2, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-interface {p1, v3, p2}, Landroid/view/Window$Callback;->onMenuOpened(ILandroid/view/Menu;)Z

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->h()Z

    :cond_4
    :goto_1
    return-void

    :cond_5
    invoke-virtual {p0, v1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p1

    iput-boolean v0, p1, Landroid/support/v7/app/j$d;->q:Z

    invoke-virtual {p0, p1, v1}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    const/4 p2, 0x0

    invoke-direct {p0, p1, p2}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)V

    return-void
.end method

.method private a(Landroid/support/v7/app/j$d;)Z
    .locals 2

    invoke-virtual {p0}, Landroid/support/v7/app/j;->n()Landroid/content/Context;

    move-result-object v0

    invoke-virtual {p1, v0}, Landroid/support/v7/app/j$d;->a(Landroid/content/Context;)V

    new-instance v0, Landroid/support/v7/app/j$c;

    iget-object v1, p1, Landroid/support/v7/app/j$d;->l:Landroid/content/Context;

    invoke-direct {v0, p0, v1}, Landroid/support/v7/app/j$c;-><init>(Landroid/support/v7/app/j;Landroid/content/Context;)V

    iput-object v0, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    const/16 v0, 0x51

    iput v0, p1, Landroid/support/v7/app/j$d;->c:I

    const/4 p1, 0x1

    return p1
.end method

.method private a(Landroid/support/v7/app/j$d;ILandroid/view/KeyEvent;I)Z
    .locals 2

    invoke-virtual {p3}, Landroid/view/KeyEvent;->isSystem()Z

    move-result v0

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    return v1

    :cond_0
    iget-boolean v0, p1, Landroid/support/v7/app/j$d;->m:Z

    if-nez v0, :cond_1

    invoke-direct {p0, p1, p3}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    move-result v0

    if-eqz v0, :cond_2

    :cond_1
    iget-object v0, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-eqz v0, :cond_2

    iget-object v0, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v0, p2, p3, p4}, Landroid/support/v7/view/menu/h;->performShortcut(ILandroid/view/KeyEvent;I)Z

    move-result v1

    :cond_2
    if-eqz v1, :cond_3

    const/4 p2, 0x1

    and-int/lit8 p3, p4, 0x1

    if-nez p3, :cond_3

    iget-object p3, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-nez p3, :cond_3

    invoke-virtual {p0, p1, p2}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    :cond_3
    return v1
.end method

.method private a(Landroid/view/ViewParent;)Z
    .locals 3

    const/4 v0, 0x0

    if-nez p1, :cond_0

    return v0

    :cond_0
    iget-object v1, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v1}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v1

    :goto_0
    if-nez p1, :cond_1

    const/4 p1, 0x1

    return p1

    :cond_1
    if-eq p1, v1, :cond_3

    instance-of v2, p1, Landroid/view/View;

    if-eqz v2, :cond_3

    move-object v2, p1

    check-cast v2, Landroid/view/View;

    invoke-static {v2}, Landroid/support/v4/g/p;->m(Landroid/view/View;)Z

    move-result v2

    if-eqz v2, :cond_2

    goto :goto_1

    :cond_2
    invoke-interface {p1}, Landroid/view/ViewParent;->getParent()Landroid/view/ViewParent;

    move-result-object p1

    goto :goto_0

    :cond_3
    :goto_1
    return v0
.end method

.method private b(Landroid/support/v7/app/j$d;)Z
    .locals 6

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    iget v1, p1, Landroid/support/v7/app/j$d;->a:I

    const/4 v2, 0x1

    if-eqz v1, :cond_0

    iget v1, p1, Landroid/support/v7/app/j$d;->a:I

    const/16 v3, 0x6c

    if-ne v1, v3, :cond_4

    :cond_0
    iget-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz v1, :cond_4

    new-instance v1, Landroid/util/TypedValue;

    invoke-direct {v1}, Landroid/util/TypedValue;-><init>()V

    invoke-virtual {v0}, Landroid/content/Context;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v3

    sget v4, Landroid/support/v7/a/a$a;->actionBarTheme:I

    invoke-virtual {v3, v4, v1, v2}, Landroid/content/res/Resources$Theme;->resolveAttribute(ILandroid/util/TypedValue;Z)Z

    const/4 v4, 0x0

    iget v5, v1, Landroid/util/TypedValue;->resourceId:I

    if-eqz v5, :cond_1

    invoke-virtual {v0}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v4

    invoke-virtual {v4}, Landroid/content/res/Resources;->newTheme()Landroid/content/res/Resources$Theme;

    move-result-object v4

    invoke-virtual {v4, v3}, Landroid/content/res/Resources$Theme;->setTo(Landroid/content/res/Resources$Theme;)V

    iget v5, v1, Landroid/util/TypedValue;->resourceId:I

    invoke-virtual {v4, v5, v2}, Landroid/content/res/Resources$Theme;->applyStyle(IZ)V

    sget v5, Landroid/support/v7/a/a$a;->actionBarWidgetTheme:I

    invoke-virtual {v4, v5, v1, v2}, Landroid/content/res/Resources$Theme;->resolveAttribute(ILandroid/util/TypedValue;Z)Z

    goto :goto_0

    :cond_1
    sget v5, Landroid/support/v7/a/a$a;->actionBarWidgetTheme:I

    invoke-virtual {v3, v5, v1, v2}, Landroid/content/res/Resources$Theme;->resolveAttribute(ILandroid/util/TypedValue;Z)Z

    :goto_0
    iget v5, v1, Landroid/util/TypedValue;->resourceId:I

    if-eqz v5, :cond_3

    if-nez v4, :cond_2

    invoke-virtual {v0}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v4

    invoke-virtual {v4}, Landroid/content/res/Resources;->newTheme()Landroid/content/res/Resources$Theme;

    move-result-object v4

    invoke-virtual {v4, v3}, Landroid/content/res/Resources$Theme;->setTo(Landroid/content/res/Resources$Theme;)V

    :cond_2
    iget v1, v1, Landroid/util/TypedValue;->resourceId:I

    invoke-virtual {v4, v1, v2}, Landroid/content/res/Resources$Theme;->applyStyle(IZ)V

    :cond_3
    if-eqz v4, :cond_4

    new-instance v1, Landroid/support/v7/view/d;

    const/4 v3, 0x0

    invoke-direct {v1, v0, v3}, Landroid/support/v7/view/d;-><init>(Landroid/content/Context;I)V

    invoke-virtual {v1}, Landroid/content/Context;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v0

    invoke-virtual {v0, v4}, Landroid/content/res/Resources$Theme;->setTo(Landroid/content/res/Resources$Theme;)V

    move-object v0, v1

    :cond_4
    new-instance v1, Landroid/support/v7/view/menu/h;

    invoke-direct {v1, v0}, Landroid/support/v7/view/menu/h;-><init>(Landroid/content/Context;)V

    invoke-virtual {v1, p0}, Landroid/support/v7/view/menu/h;->a(Landroid/support/v7/view/menu/h$a;)V

    invoke-virtual {p1, v1}, Landroid/support/v7/app/j$d;->a(Landroid/support/v7/view/menu/h;)V

    return v2
.end method

.method private b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z
    .locals 8

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result v0

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    return v1

    :cond_0
    iget-boolean v0, p1, Landroid/support/v7/app/j$d;->m:Z

    const/4 v2, 0x1

    if-eqz v0, :cond_1

    return v2

    :cond_1
    iget-object v0, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    if-eqz v0, :cond_2

    iget-object v0, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    if-eq v0, p1, :cond_2

    iget-object v0, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    invoke-virtual {p0, v0, v1}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    :cond_2
    invoke-virtual {p0}, Landroid/support/v7/app/j;->q()Landroid/view/Window$Callback;

    move-result-object v0

    if-eqz v0, :cond_3

    iget v3, p1, Landroid/support/v7/app/j$d;->a:I

    invoke-interface {v0, v3}, Landroid/view/Window$Callback;->onCreatePanelView(I)Landroid/view/View;

    move-result-object v3

    iput-object v3, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    :cond_3
    iget v3, p1, Landroid/support/v7/app/j$d;->a:I

    if-eqz v3, :cond_5

    iget v3, p1, Landroid/support/v7/app/j$d;->a:I

    const/16 v4, 0x6c

    if-ne v3, v4, :cond_4

    goto :goto_0

    :cond_4
    const/4 v3, 0x0

    goto :goto_1

    :cond_5
    :goto_0
    const/4 v3, 0x1

    :goto_1
    if-eqz v3, :cond_6

    iget-object v4, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz v4, :cond_6

    iget-object v4, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v4}, Landroid/support/v7/widget/ad;->j()V

    :cond_6
    iget-object v4, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    if-nez v4, :cond_15

    if-eqz v3, :cond_7

    invoke-virtual {p0}, Landroid/support/v7/app/j;->m()Landroid/support/v7/app/a;

    move-result-object v4

    instance-of v4, v4, Landroid/support/v7/app/m;

    if-nez v4, :cond_15

    :cond_7
    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    const/4 v5, 0x0

    if-eqz v4, :cond_8

    iget-boolean v4, p1, Landroid/support/v7/app/j$d;->r:Z

    if-eqz v4, :cond_f

    :cond_8
    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-nez v4, :cond_a

    invoke-direct {p0, p1}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;)Z

    move-result v4

    if-eqz v4, :cond_9

    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-nez v4, :cond_a

    :cond_9
    return v1

    :cond_a
    if-eqz v3, :cond_c

    iget-object v4, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz v4, :cond_c

    iget-object v4, p0, Landroid/support/v7/app/j;->v:Landroid/support/v7/app/j$a;

    if-nez v4, :cond_b

    new-instance v4, Landroid/support/v7/app/j$a;

    invoke-direct {v4, p0}, Landroid/support/v7/app/j$a;-><init>(Landroid/support/v7/app/j;)V

    iput-object v4, p0, Landroid/support/v7/app/j;->v:Landroid/support/v7/app/j$a;

    :cond_b
    iget-object v4, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    iget-object v6, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    iget-object v7, p0, Landroid/support/v7/app/j;->v:Landroid/support/v7/app/j$a;

    invoke-interface {v4, v6, v7}, Landroid/support/v7/widget/ad;->a(Landroid/view/Menu;Landroid/support/v7/view/menu/o$a;)V

    :cond_c
    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v4}, Landroid/support/v7/view/menu/h;->g()V

    iget v4, p1, Landroid/support/v7/app/j$d;->a:I

    iget-object v6, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-interface {v0, v4, v6}, Landroid/view/Window$Callback;->onCreatePanelMenu(ILandroid/view/Menu;)Z

    move-result v4

    if-nez v4, :cond_e

    invoke-virtual {p1, v5}, Landroid/support/v7/app/j$d;->a(Landroid/support/v7/view/menu/h;)V

    if-eqz v3, :cond_d

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz p1, :cond_d

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    iget-object p2, p0, Landroid/support/v7/app/j;->v:Landroid/support/v7/app/j$a;

    invoke-interface {p1, v5, p2}, Landroid/support/v7/widget/ad;->a(Landroid/view/Menu;Landroid/support/v7/view/menu/o$a;)V

    :cond_d
    return v1

    :cond_e
    iput-boolean v1, p1, Landroid/support/v7/app/j$d;->r:Z

    :cond_f
    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v4}, Landroid/support/v7/view/menu/h;->g()V

    iget-object v4, p1, Landroid/support/v7/app/j$d;->s:Landroid/os/Bundle;

    if-eqz v4, :cond_10

    iget-object v4, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    iget-object v6, p1, Landroid/support/v7/app/j$d;->s:Landroid/os/Bundle;

    invoke-virtual {v4, v6}, Landroid/support/v7/view/menu/h;->b(Landroid/os/Bundle;)V

    iput-object v5, p1, Landroid/support/v7/app/j$d;->s:Landroid/os/Bundle;

    :cond_10
    iget-object v4, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    iget-object v6, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-interface {v0, v1, v4, v6}, Landroid/view/Window$Callback;->onPreparePanel(ILandroid/view/View;Landroid/view/Menu;)Z

    move-result v0

    if-nez v0, :cond_12

    if-eqz v3, :cond_11

    iget-object p2, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz p2, :cond_11

    iget-object p2, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    iget-object v0, p0, Landroid/support/v7/app/j;->v:Landroid/support/v7/app/j$a;

    invoke-interface {p2, v5, v0}, Landroid/support/v7/widget/ad;->a(Landroid/view/Menu;Landroid/support/v7/view/menu/o$a;)V

    :cond_11
    iget-object p1, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {p1}, Landroid/support/v7/view/menu/h;->h()V

    return v1

    :cond_12
    if-eqz p2, :cond_13

    invoke-virtual {p2}, Landroid/view/KeyEvent;->getDeviceId()I

    move-result p2

    goto :goto_2

    :cond_13
    const/4 p2, -0x1

    :goto_2
    invoke-static {p2}, Landroid/view/KeyCharacterMap;->load(I)Landroid/view/KeyCharacterMap;

    move-result-object p2

    invoke-virtual {p2}, Landroid/view/KeyCharacterMap;->getKeyboardType()I

    move-result p2

    if-eq p2, v2, :cond_14

    const/4 p2, 0x1

    goto :goto_3

    :cond_14
    const/4 p2, 0x0

    :goto_3
    iput-boolean p2, p1, Landroid/support/v7/app/j$d;->p:Z

    iget-object p2, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    iget-boolean v0, p1, Landroid/support/v7/app/j$d;->p:Z

    invoke-virtual {p2, v0}, Landroid/support/v7/view/menu/h;->setQwertyMode(Z)V

    iget-object p2, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {p2}, Landroid/support/v7/view/menu/h;->h()V

    :cond_15
    iput-boolean v2, p1, Landroid/support/v7/app/j$d;->m:Z

    iput-boolean v1, p1, Landroid/support/v7/app/j$d;->n:Z

    iput-object p1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    return v2
.end method

.method private c(Landroid/support/v7/app/j$d;)Z
    .locals 3

    iget-object v0, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    const/4 v1, 0x1

    if-eqz v0, :cond_0

    iget-object v0, p1, Landroid/support/v7/app/j$d;->i:Landroid/view/View;

    iput-object v0, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    return v1

    :cond_0
    iget-object v0, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    const/4 v2, 0x0

    if-nez v0, :cond_1

    return v2

    :cond_1
    iget-object v0, p0, Landroid/support/v7/app/j;->w:Landroid/support/v7/app/j$e;

    if-nez v0, :cond_2

    new-instance v0, Landroid/support/v7/app/j$e;

    invoke-direct {v0, p0}, Landroid/support/v7/app/j$e;-><init>(Landroid/support/v7/app/j;)V

    iput-object v0, p0, Landroid/support/v7/app/j;->w:Landroid/support/v7/app/j$e;

    :cond_2
    iget-object v0, p0, Landroid/support/v7/app/j;->w:Landroid/support/v7/app/j$e;

    invoke-virtual {p1, v0}, Landroid/support/v7/app/j$d;->a(Landroid/support/v7/view/menu/o$a;)Landroid/support/v7/view/menu/p;

    move-result-object v0

    check-cast v0, Landroid/view/View;

    iput-object v0, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    iget-object p1, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    if-eqz p1, :cond_3

    goto :goto_0

    :cond_3
    const/4 v1, 0x0

    :goto_0
    return v1
.end method

.method private d(I)V
    .locals 2

    iget v0, p0, Landroid/support/v7/app/j;->s:I

    const/4 v1, 0x1

    shl-int p1, v1, p1

    or-int/2addr p1, v0

    iput p1, p0, Landroid/support/v7/app/j;->s:I

    iget-boolean p1, p0, Landroid/support/v7/app/j;->r:Z

    if-nez p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {p1}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object p1

    iget-object v0, p0, Landroid/support/v7/app/j;->H:Ljava/lang/Runnable;

    invoke-static {p1, v0}, Landroid/support/v4/g/p;->a(Landroid/view/View;Ljava/lang/Runnable;)V

    iput-boolean v1, p0, Landroid/support/v7/app/j;->r:Z

    :cond_0
    return-void
.end method

.method private d(ILandroid/view/KeyEvent;)Z
    .locals 1

    invoke-virtual {p2}, Landroid/view/KeyEvent;->getRepeatCount()I

    move-result v0

    if-nez v0, :cond_0

    const/4 v0, 0x1

    invoke-virtual {p0, p1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p1

    iget-boolean v0, p1, Landroid/support/v7/app/j$d;->o:Z

    if-nez v0, :cond_0

    invoke-direct {p0, p1, p2}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    move-result p1

    return p1

    :cond_0
    const/4 p1, 0x0

    return p1
.end method

.method private e(ILandroid/view/KeyEvent;)Z
    .locals 3

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    return v1

    :cond_0
    const/4 v0, 0x1

    invoke-virtual {p0, p1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object v2

    if-nez p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->e()Z

    move-result p1

    if-eqz p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-static {p1}, Landroid/view/ViewConfiguration;->get(Landroid/content/Context;)Landroid/view/ViewConfiguration;

    move-result-object p1

    invoke-virtual {p1}, Landroid/view/ViewConfiguration;->hasPermanentMenuKey()Z

    move-result p1

    if-nez p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->f()Z

    move-result p1

    if-nez p1, :cond_1

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result p1

    if-nez p1, :cond_5

    invoke-direct {p0, v2, p2}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    move-result p1

    if-eqz p1, :cond_5

    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->h()Z

    move-result p1

    goto :goto_2

    :cond_1
    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {p1}, Landroid/support/v7/widget/ad;->i()Z

    move-result p1

    goto :goto_2

    :cond_2
    iget-boolean p1, v2, Landroid/support/v7/app/j$d;->o:Z

    if-nez p1, :cond_6

    iget-boolean p1, v2, Landroid/support/v7/app/j$d;->n:Z

    if-eqz p1, :cond_3

    goto :goto_1

    :cond_3
    iget-boolean p1, v2, Landroid/support/v7/app/j$d;->m:Z

    if-eqz p1, :cond_5

    iget-boolean p1, v2, Landroid/support/v7/app/j$d;->r:Z

    if-eqz p1, :cond_4

    iput-boolean v1, v2, Landroid/support/v7/app/j$d;->m:Z

    invoke-direct {p0, v2, p2}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    move-result p1

    goto :goto_0

    :cond_4
    const/4 p1, 0x1

    :goto_0
    if-eqz p1, :cond_5

    invoke-direct {p0, v2, p2}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)V

    const/4 p1, 0x1

    goto :goto_2

    :cond_5
    const/4 p1, 0x0

    goto :goto_2

    :cond_6
    :goto_1
    iget-boolean p1, v2, Landroid/support/v7/app/j$d;->o:Z

    invoke-virtual {p0, v2, v0}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    :goto_2
    if-eqz p1, :cond_8

    iget-object p2, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    const-string v0, "audio"

    invoke-virtual {p2, v0}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object p2

    check-cast p2, Landroid/media/AudioManager;

    if-eqz p2, :cond_7

    invoke-virtual {p2, v1}, Landroid/media/AudioManager;->playSoundEffect(I)V

    goto :goto_3

    :cond_7
    const-string p2, "AppCompatDelegate"

    const-string v0, "Couldn\'t get audio manager"

    invoke-static {p2, v0}, Landroid/util/Log;->w(Ljava/lang/String;Ljava/lang/String;)I

    :cond_8
    :goto_3
    return p1
.end method

.method private h(I)I
    .locals 1

    const/16 v0, 0x8

    if-ne p1, v0, :cond_0

    const-string p1, "AppCompatDelegate"

    const-string v0, "You should now use the AppCompatDelegate.FEATURE_SUPPORT_ACTION_BAR id when requesting this feature."

    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/16 p1, 0x6c

    return p1

    :cond_0
    const/16 v0, 0x9

    if-ne p1, v0, :cond_1

    const-string p1, "AppCompatDelegate"

    const-string v0, "You should now use the AppCompatDelegate.FEATURE_SUPPORT_ACTION_BAR_OVERLAY id when requesting this feature."

    invoke-static {p1, v0}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    const/16 p1, 0x6d

    :cond_1
    return p1
.end method

.method private w()V
    .locals 2

    iget-boolean v0, p0, Landroid/support/v7/app/j;->x:Z

    if-nez v0, :cond_2

    invoke-direct {p0}, Landroid/support/v7/app/j;->x()Landroid/view/ViewGroup;

    move-result-object v0

    iput-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    invoke-virtual {p0}, Landroid/support/v7/app/j;->r()Ljava/lang/CharSequence;

    move-result-object v0

    invoke-static {v0}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v1

    if-nez v1, :cond_0

    invoke-virtual {p0, v0}, Landroid/support/v7/app/j;->b(Ljava/lang/CharSequence;)V

    :cond_0
    invoke-direct {p0}, Landroid/support/v7/app/j;->y()V

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    invoke-virtual {p0, v0}, Landroid/support/v7/app/j;->a(Landroid/view/ViewGroup;)V

    const/4 v0, 0x1

    iput-boolean v0, p0, Landroid/support/v7/app/j;->x:Z

    const/4 v0, 0x0

    invoke-virtual {p0, v0, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object v0

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result v1

    if-nez v1, :cond_2

    if-eqz v0, :cond_1

    iget-object v0, v0, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-nez v0, :cond_2

    :cond_1
    const/16 v0, 0x6c

    invoke-direct {p0, v0}, Landroid/support/v7/app/j;->d(I)V

    :cond_2
    return-void
.end method

.method private x()Landroid/view/ViewGroup;
    .locals 7

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    sget-object v1, Landroid/support/v7/a/a$j;->AppCompatTheme:[I

    invoke-virtual {v0, v1}, Landroid/content/Context;->obtainStyledAttributes([I)Landroid/content/res/TypedArray;

    move-result-object v0

    sget v1, Landroid/support/v7/a/a$j;->AppCompatTheme_windowActionBar:I

    invoke-virtual {v0, v1}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result v1

    if-eqz v1, :cond_11

    sget v1, Landroid/support/v7/a/a$j;->AppCompatTheme_windowNoTitle:I

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Landroid/content/res/TypedArray;->getBoolean(IZ)Z

    move-result v1

    const/4 v3, 0x1

    if-eqz v1, :cond_0

    invoke-virtual {p0, v3}, Landroid/support/v7/app/j;->c(I)Z

    goto :goto_0

    :cond_0
    sget v1, Landroid/support/v7/a/a$j;->AppCompatTheme_windowActionBar:I

    invoke-virtual {v0, v1, v2}, Landroid/content/res/TypedArray;->getBoolean(IZ)Z

    move-result v1

    if-eqz v1, :cond_1

    const/16 v1, 0x6c

    invoke-virtual {p0, v1}, Landroid/support/v7/app/j;->c(I)Z

    :cond_1
    :goto_0
    sget v1, Landroid/support/v7/a/a$j;->AppCompatTheme_windowActionBarOverlay:I

    invoke-virtual {v0, v1, v2}, Landroid/content/res/TypedArray;->getBoolean(IZ)Z

    move-result v1

    const/16 v4, 0x6d

    if-eqz v1, :cond_2

    invoke-virtual {p0, v4}, Landroid/support/v7/app/j;->c(I)Z

    :cond_2
    sget v1, Landroid/support/v7/a/a$j;->AppCompatTheme_windowActionModeOverlay:I

    invoke-virtual {v0, v1, v2}, Landroid/content/res/TypedArray;->getBoolean(IZ)Z

    move-result v1

    if-eqz v1, :cond_3

    const/16 v1, 0xa

    invoke-virtual {p0, v1}, Landroid/support/v7/app/j;->c(I)Z

    :cond_3
    sget v1, Landroid/support/v7/a/a$j;->AppCompatTheme_android_windowIsFloating:I

    invoke-virtual {v0, v1, v2}, Landroid/content/res/TypedArray;->getBoolean(IZ)Z

    move-result v1

    iput-boolean v1, p0, Landroid/support/v7/app/j;->k:Z

    invoke-virtual {v0}, Landroid/content/res/TypedArray;->recycle()V

    iget-object v0, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v0}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-static {v0}, Landroid/view/LayoutInflater;->from(Landroid/content/Context;)Landroid/view/LayoutInflater;

    move-result-object v0

    iget-boolean v1, p0, Landroid/support/v7/app/j;->l:Z

    const/4 v5, 0x0

    if-nez v1, :cond_9

    iget-boolean v1, p0, Landroid/support/v7/app/j;->k:Z

    if-eqz v1, :cond_4

    sget v1, Landroid/support/v7/a/a$g;->abc_dialog_title_material:I

    invoke-virtual {v0, v1, v5}, Landroid/view/LayoutInflater;->inflate(ILandroid/view/ViewGroup;)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    iput-boolean v2, p0, Landroid/support/v7/app/j;->i:Z

    iput-boolean v2, p0, Landroid/support/v7/app/j;->h:Z

    goto/16 :goto_4

    :cond_4
    iget-boolean v0, p0, Landroid/support/v7/app/j;->h:Z

    if-eqz v0, :cond_8

    new-instance v0, Landroid/util/TypedValue;

    invoke-direct {v0}, Landroid/util/TypedValue;-><init>()V

    iget-object v1, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-virtual {v1}, Landroid/content/Context;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v1

    sget v6, Landroid/support/v7/a/a$a;->actionBarTheme:I

    invoke-virtual {v1, v6, v0, v3}, Landroid/content/res/Resources$Theme;->resolveAttribute(ILandroid/util/TypedValue;Z)Z

    iget v1, v0, Landroid/util/TypedValue;->resourceId:I

    if-eqz v1, :cond_5

    new-instance v1, Landroid/support/v7/view/d;

    iget-object v3, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    iget v0, v0, Landroid/util/TypedValue;->resourceId:I

    invoke-direct {v1, v3, v0}, Landroid/support/v7/view/d;-><init>(Landroid/content/Context;I)V

    goto :goto_1

    :cond_5
    iget-object v1, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    :goto_1
    invoke-static {v1}, Landroid/view/LayoutInflater;->from(Landroid/content/Context;)Landroid/view/LayoutInflater;

    move-result-object v0

    sget v1, Landroid/support/v7/a/a$g;->abc_screen_toolbar:I

    invoke-virtual {v0, v1, v5}, Landroid/view/LayoutInflater;->inflate(ILandroid/view/ViewGroup;)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    sget v1, Landroid/support/v7/a/a$f;->decor_content_parent:I

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v1

    check-cast v1, Landroid/support/v7/widget/ad;

    iput-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    iget-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-virtual {p0}, Landroid/support/v7/app/j;->q()Landroid/view/Window$Callback;

    move-result-object v3

    invoke-interface {v1, v3}, Landroid/support/v7/widget/ad;->setWindowCallback(Landroid/view/Window$Callback;)V

    iget-boolean v1, p0, Landroid/support/v7/app/j;->i:Z

    if-eqz v1, :cond_6

    iget-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v1, v4}, Landroid/support/v7/widget/ad;->a(I)V

    :cond_6
    iget-boolean v1, p0, Landroid/support/v7/app/j;->B:Z

    if-eqz v1, :cond_7

    iget-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    const/4 v3, 0x2

    invoke-interface {v1, v3}, Landroid/support/v7/widget/ad;->a(I)V

    :cond_7
    iget-boolean v1, p0, Landroid/support/v7/app/j;->C:Z

    if-eqz v1, :cond_c

    iget-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    const/4 v3, 0x5

    invoke-interface {v1, v3}, Landroid/support/v7/widget/ad;->a(I)V

    goto :goto_4

    :cond_8
    move-object v0, v5

    goto :goto_4

    :cond_9
    iget-boolean v1, p0, Landroid/support/v7/app/j;->j:Z

    if-eqz v1, :cond_a

    sget v1, Landroid/support/v7/a/a$g;->abc_screen_simple_overlay_action_mode:I

    :goto_2
    invoke-virtual {v0, v1, v5}, Landroid/view/LayoutInflater;->inflate(ILandroid/view/ViewGroup;)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    goto :goto_3

    :cond_a
    sget v1, Landroid/support/v7/a/a$g;->abc_screen_simple:I

    goto :goto_2

    :goto_3
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v3, 0x15

    if-lt v1, v3, :cond_b

    new-instance v1, Landroid/support/v7/app/j$2;

    invoke-direct {v1, p0}, Landroid/support/v7/app/j$2;-><init>(Landroid/support/v7/app/j;)V

    invoke-static {v0, v1}, Landroid/support/v4/g/p;->a(Landroid/view/View;Landroid/support/v4/g/n;)V

    goto :goto_4

    :cond_b
    move-object v1, v0

    check-cast v1, Landroid/support/v7/widget/ah;

    new-instance v3, Landroid/support/v7/app/j$3;

    invoke-direct {v3, p0}, Landroid/support/v7/app/j$3;-><init>(Landroid/support/v7/app/j;)V

    invoke-interface {v1, v3}, Landroid/support/v7/widget/ah;->setOnFitSystemWindowsListener(Landroid/support/v7/widget/ah$a;)V

    :cond_c
    :goto_4
    if-eqz v0, :cond_10

    iget-object v1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-nez v1, :cond_d

    sget v1, Landroid/support/v7/a/a$f;->title:I

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v1

    check-cast v1, Landroid/widget/TextView;

    iput-object v1, p0, Landroid/support/v7/app/j;->z:Landroid/widget/TextView;

    :cond_d
    invoke-static {v0}, Landroid/support/v7/widget/bc;->b(Landroid/view/View;)V

    sget v1, Landroid/support/v7/a/a$f;->action_bar_activity_content:I

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v1

    check-cast v1, Landroid/support/v7/widget/ContentFrameLayout;

    iget-object v3, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    const v4, 0x1020002

    invoke-virtual {v3, v4}, Landroid/view/Window;->findViewById(I)Landroid/view/View;

    move-result-object v3

    check-cast v3, Landroid/view/ViewGroup;

    if-eqz v3, :cond_f

    :goto_5
    invoke-virtual {v3}, Landroid/view/ViewGroup;->getChildCount()I

    move-result v6

    if-lez v6, :cond_e

    invoke-virtual {v3, v2}, Landroid/view/ViewGroup;->getChildAt(I)Landroid/view/View;

    move-result-object v6

    invoke-virtual {v3, v2}, Landroid/view/ViewGroup;->removeViewAt(I)V

    invoke-virtual {v1, v6}, Landroid/support/v7/widget/ContentFrameLayout;->addView(Landroid/view/View;)V

    goto :goto_5

    :cond_e
    const/4 v2, -0x1

    invoke-virtual {v3, v2}, Landroid/view/ViewGroup;->setId(I)V

    invoke-virtual {v1, v4}, Landroid/support/v7/widget/ContentFrameLayout;->setId(I)V

    instance-of v2, v3, Landroid/widget/FrameLayout;

    if-eqz v2, :cond_f

    check-cast v3, Landroid/widget/FrameLayout;

    invoke-virtual {v3, v5}, Landroid/widget/FrameLayout;->setForeground(Landroid/graphics/drawable/Drawable;)V

    :cond_f
    iget-object v2, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v2, v0}, Landroid/view/Window;->setContentView(Landroid/view/View;)V

    new-instance v2, Landroid/support/v7/app/j$4;

    invoke-direct {v2, p0}, Landroid/support/v7/app/j$4;-><init>(Landroid/support/v7/app/j;)V

    invoke-virtual {v1, v2}, Landroid/support/v7/widget/ContentFrameLayout;->setAttachListener(Landroid/support/v7/widget/ContentFrameLayout$a;)V

    return-object v0

    :cond_10
    new-instance v0, Ljava/lang/IllegalArgumentException;

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "AppCompat does not support the current theme features: { windowActionBar: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-boolean v2, p0, Landroid/support/v7/app/j;->h:Z

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    const-string v2, ", windowActionBarOverlay: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-boolean v2, p0, Landroid/support/v7/app/j;->i:Z

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    const-string v2, ", android:windowIsFloating: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-boolean v2, p0, Landroid/support/v7/app/j;->k:Z

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    const-string v2, ", windowActionModeOverlay: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-boolean v2, p0, Landroid/support/v7/app/j;->j:Z

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    const-string v2, ", windowNoTitle: "

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-boolean v2, p0, Landroid/support/v7/app/j;->l:Z

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Z)Ljava/lang/StringBuilder;

    const-string v2, " }"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-direct {v0, v1}, Ljava/lang/IllegalArgumentException;-><init>(Ljava/lang/String;)V

    throw v0

    :cond_11
    invoke-virtual {v0}, Landroid/content/res/TypedArray;->recycle()V

    new-instance v0, Ljava/lang/IllegalStateException;

    const-string v1, "You need to use a Theme.AppCompat theme (or descendant) with this activity."

    invoke-direct {v0, v1}, Ljava/lang/IllegalStateException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method private y()V
    .locals 5

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    const v1, 0x1020002

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/support/v7/widget/ContentFrameLayout;

    iget-object v1, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v1}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v1

    invoke-virtual {v1}, Landroid/view/View;->getPaddingLeft()I

    move-result v2

    invoke-virtual {v1}, Landroid/view/View;->getPaddingTop()I

    move-result v3

    invoke-virtual {v1}, Landroid/view/View;->getPaddingRight()I

    move-result v4

    invoke-virtual {v1}, Landroid/view/View;->getPaddingBottom()I

    move-result v1

    invoke-virtual {v0, v2, v3, v4, v1}, Landroid/support/v7/widget/ContentFrameLayout;->a(IIII)V

    iget-object v1, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    sget-object v2, Landroid/support/v7/a/a$j;->AppCompatTheme:[I

    invoke-virtual {v1, v2}, Landroid/content/Context;->obtainStyledAttributes([I)Landroid/content/res/TypedArray;

    move-result-object v1

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowMinWidthMajor:I

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->getMinWidthMajor()Landroid/util/TypedValue;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Landroid/content/res/TypedArray;->getValue(ILandroid/util/TypedValue;)Z

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowMinWidthMinor:I

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->getMinWidthMinor()Landroid/util/TypedValue;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Landroid/content/res/TypedArray;->getValue(ILandroid/util/TypedValue;)Z

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedWidthMajor:I

    invoke-virtual {v1, v2}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result v2

    if-eqz v2, :cond_0

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedWidthMajor:I

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->getFixedWidthMajor()Landroid/util/TypedValue;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Landroid/content/res/TypedArray;->getValue(ILandroid/util/TypedValue;)Z

    :cond_0
    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedWidthMinor:I

    invoke-virtual {v1, v2}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result v2

    if-eqz v2, :cond_1

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedWidthMinor:I

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->getFixedWidthMinor()Landroid/util/TypedValue;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Landroid/content/res/TypedArray;->getValue(ILandroid/util/TypedValue;)Z

    :cond_1
    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedHeightMajor:I

    invoke-virtual {v1, v2}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result v2

    if-eqz v2, :cond_2

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedHeightMajor:I

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->getFixedHeightMajor()Landroid/util/TypedValue;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Landroid/content/res/TypedArray;->getValue(ILandroid/util/TypedValue;)Z

    :cond_2
    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedHeightMinor:I

    invoke-virtual {v1, v2}, Landroid/content/res/TypedArray;->hasValue(I)Z

    move-result v2

    if-eqz v2, :cond_3

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_windowFixedHeightMinor:I

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->getFixedHeightMinor()Landroid/util/TypedValue;

    move-result-object v3

    invoke-virtual {v1, v2, v3}, Landroid/content/res/TypedArray;->getValue(ILandroid/util/TypedValue;)Z

    :cond_3
    invoke-virtual {v1}, Landroid/content/res/TypedArray;->recycle()V

    invoke-virtual {v0}, Landroid/support/v7/widget/ContentFrameLayout;->requestLayout()V

    return-void
.end method

.method private z()V
    .locals 2

    iget-boolean v0, p0, Landroid/support/v7/app/j;->x:Z

    if-nez v0, :cond_0

    return-void

    :cond_0
    new-instance v0, Landroid/util/AndroidRuntimeException;

    const-string v1, "Window feature must be requested before adding content"

    invoke-direct {v0, v1}, Landroid/util/AndroidRuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method protected a(IZ)Landroid/support/v7/app/j$d;
    .locals 3

    iget-object p2, p0, Landroid/support/v7/app/j;->E:[Landroid/support/v7/app/j$d;

    if-eqz p2, :cond_0

    array-length v0, p2

    if-gt v0, p1, :cond_2

    :cond_0
    add-int/lit8 v0, p1, 0x1

    new-array v0, v0, [Landroid/support/v7/app/j$d;

    if-eqz p2, :cond_1

    array-length v1, p2

    const/4 v2, 0x0

    invoke-static {p2, v2, v0, v2, v1}, Ljava/lang/System;->arraycopy(Ljava/lang/Object;ILjava/lang/Object;II)V

    :cond_1
    iput-object v0, p0, Landroid/support/v7/app/j;->E:[Landroid/support/v7/app/j$d;

    move-object p2, v0

    :cond_2
    aget-object v0, p2, p1

    if-nez v0, :cond_3

    new-instance v0, Landroid/support/v7/app/j$d;

    invoke-direct {v0, p1}, Landroid/support/v7/app/j$d;-><init>(I)V

    aput-object v0, p2, p1

    :cond_3
    return-object v0
.end method

.method a(Landroid/view/Menu;)Landroid/support/v7/app/j$d;
    .locals 5

    iget-object v0, p0, Landroid/support/v7/app/j;->E:[Landroid/support/v7/app/j$d;

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    array-length v2, v0

    goto :goto_0

    :cond_0
    const/4 v2, 0x0

    :goto_0
    if-ge v1, v2, :cond_2

    aget-object v3, v0, v1

    if-eqz v3, :cond_1

    iget-object v4, v3, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-ne v4, p1, :cond_1

    return-object v3

    :cond_1
    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_2
    const/4 p1, 0x0

    return-object p1
.end method

.method a(Landroid/support/v7/view/b$a;)Landroid/support/v7/view/b;
    .locals 7

    invoke-virtual {p0}, Landroid/support/v7/app/j;->t()V

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    invoke-virtual {v0}, Landroid/support/v7/view/b;->c()V

    :cond_0
    instance-of v0, p1, Landroid/support/v7/app/j$b;

    if-nez v0, :cond_1

    new-instance v0, Landroid/support/v7/app/j$b;

    invoke-direct {v0, p0, p1}, Landroid/support/v7/app/j$b;-><init>(Landroid/support/v7/app/j;Landroid/support/v7/view/b$a;)V

    move-object p1, v0

    :cond_1
    iget-object v0, p0, Landroid/support/v7/app/j;->e:Landroid/support/v7/app/d;

    const/4 v1, 0x0

    if-eqz v0, :cond_2

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result v0

    if-nez v0, :cond_2

    :try_start_0
    iget-object v0, p0, Landroid/support/v7/app/j;->e:Landroid/support/v7/app/d;

    invoke-interface {v0, p1}, Landroid/support/v7/app/d;->a(Landroid/support/v7/view/b$a;)Landroid/support/v7/view/b;

    move-result-object v0
    :try_end_0
    .catch Ljava/lang/AbstractMethodError; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    :cond_2
    move-object v0, v1

    :goto_0
    if-eqz v0, :cond_3

    iput-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    goto/16 :goto_5

    :cond_3
    iget-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    const/4 v2, 0x0

    const/4 v3, 0x1

    if-nez v0, :cond_6

    iget-boolean v0, p0, Landroid/support/v7/app/j;->k:Z

    if-eqz v0, :cond_5

    new-instance v0, Landroid/util/TypedValue;

    invoke-direct {v0}, Landroid/util/TypedValue;-><init>()V

    iget-object v4, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-virtual {v4}, Landroid/content/Context;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v4

    sget v5, Landroid/support/v7/a/a$a;->actionBarTheme:I

    invoke-virtual {v4, v5, v0, v3}, Landroid/content/res/Resources$Theme;->resolveAttribute(ILandroid/util/TypedValue;Z)Z

    iget v5, v0, Landroid/util/TypedValue;->resourceId:I

    if-eqz v5, :cond_4

    iget-object v5, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-virtual {v5}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v5

    invoke-virtual {v5}, Landroid/content/res/Resources;->newTheme()Landroid/content/res/Resources$Theme;

    move-result-object v5

    invoke-virtual {v5, v4}, Landroid/content/res/Resources$Theme;->setTo(Landroid/content/res/Resources$Theme;)V

    iget v4, v0, Landroid/util/TypedValue;->resourceId:I

    invoke-virtual {v5, v4, v3}, Landroid/content/res/Resources$Theme;->applyStyle(IZ)V

    new-instance v4, Landroid/support/v7/view/d;

    iget-object v6, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-direct {v4, v6, v2}, Landroid/support/v7/view/d;-><init>(Landroid/content/Context;I)V

    invoke-virtual {v4}, Landroid/content/Context;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v6

    invoke-virtual {v6, v5}, Landroid/content/res/Resources$Theme;->setTo(Landroid/content/res/Resources$Theme;)V

    goto :goto_1

    :cond_4
    iget-object v4, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    :goto_1
    new-instance v5, Landroid/support/v7/widget/ActionBarContextView;

    invoke-direct {v5, v4}, Landroid/support/v7/widget/ActionBarContextView;-><init>(Landroid/content/Context;)V

    iput-object v5, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    new-instance v5, Landroid/widget/PopupWindow;

    sget v6, Landroid/support/v7/a/a$a;->actionModePopupWindowStyle:I

    invoke-direct {v5, v4, v1, v6}, Landroid/widget/PopupWindow;-><init>(Landroid/content/Context;Landroid/util/AttributeSet;I)V

    iput-object v5, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    iget-object v5, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    const/4 v6, 0x2

    invoke-static {v5, v6}, Landroid/support/v4/widget/j;->a(Landroid/widget/PopupWindow;I)V

    iget-object v5, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    iget-object v6, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v5, v6}, Landroid/widget/PopupWindow;->setContentView(Landroid/view/View;)V

    iget-object v5, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    const/4 v6, -0x1

    invoke-virtual {v5, v6}, Landroid/widget/PopupWindow;->setWidth(I)V

    invoke-virtual {v4}, Landroid/content/Context;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v5

    sget v6, Landroid/support/v7/a/a$a;->actionBarSize:I

    invoke-virtual {v5, v6, v0, v3}, Landroid/content/res/Resources$Theme;->resolveAttribute(ILandroid/util/TypedValue;Z)Z

    iget v0, v0, Landroid/util/TypedValue;->data:I

    invoke-virtual {v4}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v4

    invoke-virtual {v4}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;

    move-result-object v4

    invoke-static {v0, v4}, Landroid/util/TypedValue;->complexToDimensionPixelSize(ILandroid/util/DisplayMetrics;)I

    move-result v0

    iget-object v4, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v4, v0}, Landroid/support/v7/widget/ActionBarContextView;->setContentHeight(I)V

    iget-object v0, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    const/4 v4, -0x2

    invoke-virtual {v0, v4}, Landroid/widget/PopupWindow;->setHeight(I)V

    new-instance v0, Landroid/support/v7/app/j$5;

    invoke-direct {v0, p0}, Landroid/support/v7/app/j$5;-><init>(Landroid/support/v7/app/j;)V

    iput-object v0, p0, Landroid/support/v7/app/j;->p:Ljava/lang/Runnable;

    goto :goto_2

    :cond_5
    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    sget v4, Landroid/support/v7/a/a$f;->action_mode_bar_stub:I

    invoke-virtual {v0, v4}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/support/v7/widget/ViewStubCompat;

    if-eqz v0, :cond_6

    invoke-virtual {p0}, Landroid/support/v7/app/j;->n()Landroid/content/Context;

    move-result-object v4

    invoke-static {v4}, Landroid/view/LayoutInflater;->from(Landroid/content/Context;)Landroid/view/LayoutInflater;

    move-result-object v4

    invoke-virtual {v0, v4}, Landroid/support/v7/widget/ViewStubCompat;->setLayoutInflater(Landroid/view/LayoutInflater;)V

    invoke-virtual {v0}, Landroid/support/v7/widget/ViewStubCompat;->a()Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/support/v7/widget/ActionBarContextView;

    iput-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    :cond_6
    :goto_2
    iget-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    if-eqz v0, :cond_b

    invoke-virtual {p0}, Landroid/support/v7/app/j;->t()V

    iget-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v0}, Landroid/support/v7/widget/ActionBarContextView;->c()V

    new-instance v0, Landroid/support/v7/view/e;

    iget-object v4, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v4}, Landroid/support/v7/widget/ActionBarContextView;->getContext()Landroid/content/Context;

    move-result-object v4

    iget-object v5, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    iget-object v6, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    if-nez v6, :cond_7

    goto :goto_3

    :cond_7
    const/4 v3, 0x0

    :goto_3
    invoke-direct {v0, v4, v5, p1, v3}, Landroid/support/v7/view/e;-><init>(Landroid/content/Context;Landroid/support/v7/widget/ActionBarContextView;Landroid/support/v7/view/b$a;Z)V

    invoke-virtual {v0}, Landroid/support/v7/view/b;->b()Landroid/view/Menu;

    move-result-object v3

    invoke-interface {p1, v0, v3}, Landroid/support/v7/view/b$a;->a(Landroid/support/v7/view/b;Landroid/view/Menu;)Z

    move-result p1

    if-eqz p1, :cond_a

    invoke-virtual {v0}, Landroid/support/v7/view/b;->d()V

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContextView;->a(Landroid/support/v7/view/b;)V

    iput-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    invoke-virtual {p0}, Landroid/support/v7/app/j;->s()Z

    move-result p1

    const/high16 v0, 0x3f800000    # 1.0f

    if-eqz p1, :cond_8

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    const/4 v1, 0x0

    invoke-virtual {p1, v1}, Landroid/support/v7/widget/ActionBarContextView;->setAlpha(F)V

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-static {p1}, Landroid/support/v4/g/p;->d(Landroid/view/View;)Landroid/support/v4/g/s;

    move-result-object p1

    invoke-virtual {p1, v0}, Landroid/support/v4/g/s;->a(F)Landroid/support/v4/g/s;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    iget-object p1, p0, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    new-instance v0, Landroid/support/v7/app/j$6;

    invoke-direct {v0, p0}, Landroid/support/v7/app/j$6;-><init>(Landroid/support/v7/app/j;)V

    invoke-virtual {p1, v0}, Landroid/support/v4/g/s;->a(Landroid/support/v4/g/t;)Landroid/support/v4/g/s;

    goto :goto_4

    :cond_8
    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContextView;->setAlpha(F)V

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1, v2}, Landroid/support/v7/widget/ActionBarContextView;->setVisibility(I)V

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    const/16 v0, 0x20

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/ActionBarContextView;->sendAccessibilityEvent(I)V

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1}, Landroid/support/v7/widget/ActionBarContextView;->getParent()Landroid/view/ViewParent;

    move-result-object p1

    instance-of p1, p1, Landroid/view/View;

    if-eqz p1, :cond_9

    iget-object p1, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {p1}, Landroid/support/v7/widget/ActionBarContextView;->getParent()Landroid/view/ViewParent;

    move-result-object p1

    check-cast p1, Landroid/view/View;

    invoke-static {p1}, Landroid/support/v4/g/p;->g(Landroid/view/View;)V

    :cond_9
    :goto_4
    iget-object p1, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    if-eqz p1, :cond_b

    iget-object p1, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {p1}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object p1

    iget-object v0, p0, Landroid/support/v7/app/j;->p:Ljava/lang/Runnable;

    invoke-virtual {p1, v0}, Landroid/view/View;->post(Ljava/lang/Runnable;)Z

    goto :goto_5

    :cond_a
    iput-object v1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    :cond_b
    :goto_5
    iget-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    if-eqz p1, :cond_c

    iget-object p1, p0, Landroid/support/v7/app/j;->e:Landroid/support/v7/app/d;

    if-eqz p1, :cond_c

    iget-object p1, p0, Landroid/support/v7/app/j;->e:Landroid/support/v7/app/d;

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    invoke-interface {p1, v0}, Landroid/support/v7/app/d;->a(Landroid/support/v7/view/b;)V

    :cond_c
    iget-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    return-object p1
.end method

.method public a(I)Landroid/view/View;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "<T:",
            "Landroid/view/View;",
            ">(I)TT;"
        }
    .end annotation

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    iget-object v0, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v0, p1}, Landroid/view/Window;->findViewById(I)Landroid/view/View;

    move-result-object p1

    return-object p1
.end method

.method a(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;
    .locals 0

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    instance-of p1, p1, Landroid/view/LayoutInflater$Factory;

    if-eqz p1, :cond_0

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    check-cast p1, Landroid/view/LayoutInflater$Factory;

    invoke-interface {p1, p2, p3, p4}, Landroid/view/LayoutInflater$Factory;->onCreateView(Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;

    move-result-object p1

    if-eqz p1, :cond_0

    return-object p1

    :cond_0
    const/4 p1, 0x0

    return-object p1
.end method

.method a(ILandroid/support/v7/app/j$d;Landroid/view/Menu;)V
    .locals 1

    if-nez p3, :cond_1

    if-nez p2, :cond_0

    if-ltz p1, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->E:[Landroid/support/v7/app/j$d;

    array-length v0, v0

    if-ge p1, v0, :cond_0

    iget-object p2, p0, Landroid/support/v7/app/j;->E:[Landroid/support/v7/app/j$d;

    aget-object p2, p2, p1

    :cond_0
    if-eqz p2, :cond_1

    iget-object p3, p2, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    :cond_1
    if-eqz p2, :cond_2

    iget-boolean p2, p2, Landroid/support/v7/app/j$d;->o:Z

    if-nez p2, :cond_2

    return-void

    :cond_2
    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result p2

    if-nez p2, :cond_3

    iget-object p2, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    invoke-interface {p2, p1, p3}, Landroid/view/Window$Callback;->onPanelClosed(ILandroid/view/Menu;)V

    :cond_3
    return-void
.end method

.method a(ILandroid/view/Menu;)V
    .locals 1

    const/4 p2, 0x0

    const/16 v0, 0x6c

    if-ne p1, v0, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object p1

    if-eqz p1, :cond_1

    invoke-virtual {p1, p2}, Landroid/support/v7/app/a;->e(Z)V

    goto :goto_0

    :cond_0
    if-nez p1, :cond_1

    const/4 v0, 0x1

    invoke-virtual {p0, p1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p1

    iget-boolean v0, p1, Landroid/support/v7/app/j$d;->o:Z

    if-eqz v0, :cond_1

    invoke-virtual {p0, p1, p2}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    :cond_1
    :goto_0
    return-void
.end method

.method public a(Landroid/content/res/Configuration;)V
    .locals 1

    iget-boolean v0, p0, Landroid/support/v7/app/j;->h:Z

    if-eqz v0, :cond_0

    iget-boolean v0, p0, Landroid/support/v7/app/j;->x:Z

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1}, Landroid/support/v7/app/a;->a(Landroid/content/res/Configuration;)V

    :cond_0
    invoke-static {}, Landroid/support/v7/widget/l;->a()Landroid/support/v7/widget/l;

    move-result-object p1

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-virtual {p1, v0}, Landroid/support/v7/widget/l;->a(Landroid/content/Context;)V

    invoke-virtual {p0}, Landroid/support/v7/app/j;->i()Z

    return-void
.end method

.method public a(Landroid/os/Bundle;)V
    .locals 1

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    instance-of p1, p1, Landroid/app/Activity;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    check-cast p1, Landroid/app/Activity;

    invoke-static {p1}, Landroid/support/v4/app/v;->b(Landroid/app/Activity;)Ljava/lang/String;

    move-result-object p1

    if-eqz p1, :cond_1

    invoke-virtual {p0}, Landroid/support/v7/app/j;->m()Landroid/support/v7/app/a;

    move-result-object p1

    const/4 v0, 0x1

    if-nez p1, :cond_0

    iput-boolean v0, p0, Landroid/support/v7/app/j;->I:Z

    goto :goto_0

    :cond_0
    invoke-virtual {p1, v0}, Landroid/support/v7/app/a;->c(Z)V

    :cond_1
    :goto_0
    return-void
.end method

.method a(Landroid/support/v7/app/j$d;Z)V
    .locals 3

    if-eqz p2, :cond_0

    iget v0, p1, Landroid/support/v7/app/j$d;->a:I

    if-nez v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v0}, Landroid/support/v7/widget/ad;->f()Z

    move-result v0

    if-eqz v0, :cond_0

    iget-object p1, p1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {p0, p1}, Landroid/support/v7/app/j;->b(Landroid/support/v7/view/menu/h;)V

    return-void

    :cond_0
    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    const-string v1, "window"

    invoke-virtual {v0, v1}, Landroid/content/Context;->getSystemService(Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v0

    check-cast v0, Landroid/view/WindowManager;

    const/4 v1, 0x0

    if-eqz v0, :cond_1

    iget-boolean v2, p1, Landroid/support/v7/app/j$d;->o:Z

    if-eqz v2, :cond_1

    iget-object v2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    if-eqz v2, :cond_1

    iget-object v2, p1, Landroid/support/v7/app/j$d;->g:Landroid/view/ViewGroup;

    invoke-interface {v0, v2}, Landroid/view/WindowManager;->removeView(Landroid/view/View;)V

    if-eqz p2, :cond_1

    iget p2, p1, Landroid/support/v7/app/j$d;->a:I

    invoke-virtual {p0, p2, p1, v1}, Landroid/support/v7/app/j;->a(ILandroid/support/v7/app/j$d;Landroid/view/Menu;)V

    :cond_1
    const/4 p2, 0x0

    iput-boolean p2, p1, Landroid/support/v7/app/j$d;->m:Z

    iput-boolean p2, p1, Landroid/support/v7/app/j$d;->n:Z

    iput-boolean p2, p1, Landroid/support/v7/app/j$d;->o:Z

    iput-object v1, p1, Landroid/support/v7/app/j$d;->h:Landroid/view/View;

    const/4 p2, 0x1

    iput-boolean p2, p1, Landroid/support/v7/app/j$d;->q:Z

    iget-object p2, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    if-ne p2, p1, :cond_2

    iput-object v1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    :cond_2
    return-void
.end method

.method public a(Landroid/support/v7/view/menu/h;)V
    .locals 1

    const/4 v0, 0x1

    invoke-direct {p0, p1, v0}, Landroid/support/v7/app/j;->a(Landroid/support/v7/view/menu/h;Z)V

    return-void
.end method

.method public a(Landroid/view/View;)V
    .locals 2

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    const v1, 0x1020002

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    invoke-virtual {v0}, Landroid/view/ViewGroup;->removeAllViews()V

    invoke-virtual {v0, p1}, Landroid/view/ViewGroup;->addView(Landroid/view/View;)V

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    invoke-interface {p1}, Landroid/view/Window$Callback;->onContentChanged()V

    return-void
.end method

.method public a(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V
    .locals 2

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    const v1, 0x1020002

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    invoke-virtual {v0}, Landroid/view/ViewGroup;->removeAllViews()V

    invoke-virtual {v0, p1, p2}, Landroid/view/ViewGroup;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    invoke-interface {p1}, Landroid/view/Window$Callback;->onContentChanged()V

    return-void
.end method

.method a(Landroid/view/ViewGroup;)V
    .locals 0

    return-void
.end method

.method a(ILandroid/view/KeyEvent;)Z
    .locals 3

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object v0

    const/4 v1, 0x1

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1, p2}, Landroid/support/v7/app/a;->a(ILandroid/view/KeyEvent;)Z

    move-result p1

    if-eqz p1, :cond_0

    return v1

    :cond_0
    iget-object p1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    if-eqz p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    invoke-virtual {p2}, Landroid/view/KeyEvent;->getKeyCode()I

    move-result v0

    invoke-direct {p0, p1, v0, p2, v1}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;ILandroid/view/KeyEvent;I)Z

    move-result p1

    if-eqz p1, :cond_2

    iget-object p1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    iput-boolean v1, p1, Landroid/support/v7/app/j$d;->n:Z

    :cond_1
    return v1

    :cond_2
    iget-object p1, p0, Landroid/support/v7/app/j;->F:Landroid/support/v7/app/j$d;

    const/4 v0, 0x0

    if-nez p1, :cond_3

    invoke-virtual {p0, v0, v1}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p1

    invoke-direct {p0, p1, p2}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    invoke-virtual {p2}, Landroid/view/KeyEvent;->getKeyCode()I

    move-result v2

    invoke-direct {p0, p1, v2, p2, v1}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;ILandroid/view/KeyEvent;I)Z

    move-result p2

    iput-boolean v0, p1, Landroid/support/v7/app/j$d;->m:Z

    if-eqz p2, :cond_3

    return v1

    :cond_3
    return v0
.end method

.method public a(Landroid/support/v7/view/menu/h;Landroid/view/MenuItem;)Z
    .locals 2

    invoke-virtual {p0}, Landroid/support/v7/app/j;->q()Landroid/view/Window$Callback;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result v1

    if-nez v1, :cond_0

    invoke-virtual {p1}, Landroid/support/v7/view/menu/h;->p()Landroid/support/v7/view/menu/h;

    move-result-object p1

    invoke-virtual {p0, p1}, Landroid/support/v7/app/j;->a(Landroid/view/Menu;)Landroid/support/v7/app/j$d;

    move-result-object p1

    if-eqz p1, :cond_0

    iget p1, p1, Landroid/support/v7/app/j$d;->a:I

    invoke-interface {v0, p1, p2}, Landroid/view/Window$Callback;->onMenuItemSelected(ILandroid/view/MenuItem;)Z

    move-result p1

    return p1

    :cond_0
    const/4 p1, 0x0

    return p1
.end method

.method a(Landroid/view/KeyEvent;)Z
    .locals 3

    invoke-virtual {p1}, Landroid/view/KeyEvent;->getKeyCode()I

    move-result v0

    const/4 v1, 0x1

    const/16 v2, 0x52

    if-ne v0, v2, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    invoke-interface {v0, p1}, Landroid/view/Window$Callback;->dispatchKeyEvent(Landroid/view/KeyEvent;)Z

    move-result v0

    if-eqz v0, :cond_0

    return v1

    :cond_0
    invoke-virtual {p1}, Landroid/view/KeyEvent;->getKeyCode()I

    move-result v0

    invoke-virtual {p1}, Landroid/view/KeyEvent;->getAction()I

    move-result v2

    if-nez v2, :cond_1

    goto :goto_0

    :cond_1
    const/4 v1, 0x0

    :goto_0
    if-eqz v1, :cond_2

    invoke-virtual {p0, v0, p1}, Landroid/support/v7/app/j;->c(ILandroid/view/KeyEvent;)Z

    move-result p1

    goto :goto_1

    :cond_2
    invoke-virtual {p0, v0, p1}, Landroid/support/v7/app/j;->b(ILandroid/view/KeyEvent;)Z

    move-result p1

    :goto_1
    return p1
.end method

.method public b(Landroid/support/v7/view/b$a;)Landroid/support/v7/view/b;
    .locals 2

    if-eqz p1, :cond_3

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    invoke-virtual {v0}, Landroid/support/v7/view/b;->c()V

    :cond_0
    new-instance v0, Landroid/support/v7/app/j$b;

    invoke-direct {v0, p0, p1}, Landroid/support/v7/app/j$b;-><init>(Landroid/support/v7/app/j;Landroid/support/v7/view/b$a;)V

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object p1

    if-eqz p1, :cond_1

    invoke-virtual {p1, v0}, Landroid/support/v7/app/a;->a(Landroid/support/v7/view/b$a;)Landroid/support/v7/view/b;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    iget-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/j;->e:Landroid/support/v7/app/d;

    if-eqz p1, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/j;->e:Landroid/support/v7/app/d;

    iget-object v1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    invoke-interface {p1, v1}, Landroid/support/v7/app/d;->a(Landroid/support/v7/view/b;)V

    :cond_1
    iget-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    if-nez p1, :cond_2

    invoke-virtual {p0, v0}, Landroid/support/v7/app/j;->a(Landroid/support/v7/view/b$a;)Landroid/support/v7/view/b;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    :cond_2
    iget-object p1, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    return-object p1

    :cond_3
    new-instance p1, Ljava/lang/IllegalArgumentException;

    const-string v0, "ActionMode callback can not be null."

    invoke-direct {p1, v0}, Ljava/lang/IllegalArgumentException;-><init>(Ljava/lang/String;)V

    throw p1
.end method

.method public b(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;
    .locals 11

    iget-object v0, p0, Landroid/support/v7/app/j;->L:Landroid/support/v7/app/AppCompatViewInflater;

    const/4 v1, 0x0

    if-nez v0, :cond_2

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    sget-object v2, Landroid/support/v7/a/a$j;->AppCompatTheme:[I

    invoke-virtual {v0, v2}, Landroid/content/Context;->obtainStyledAttributes([I)Landroid/content/res/TypedArray;

    move-result-object v0

    sget v2, Landroid/support/v7/a/a$j;->AppCompatTheme_viewInflaterClass:I

    invoke-virtual {v0, v2}, Landroid/content/res/TypedArray;->getString(I)Ljava/lang/String;

    move-result-object v0

    if-eqz v0, :cond_1

    const-class v2, Landroid/support/v7/app/AppCompatViewInflater;

    invoke-virtual {v2}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v2, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_0

    goto :goto_0

    :cond_0
    :try_start_0
    invoke-static {v0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object v2

    new-array v3, v1, [Ljava/lang/Class;

    invoke-virtual {v2, v3}, Ljava/lang/Class;->getDeclaredConstructor([Ljava/lang/Class;)Ljava/lang/reflect/Constructor;

    move-result-object v2

    new-array v3, v1, [Ljava/lang/Object;

    invoke-virtual {v2, v3}, Ljava/lang/reflect/Constructor;->newInstance([Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Landroid/support/v7/app/AppCompatViewInflater;

    iput-object v2, p0, Landroid/support/v7/app/j;->L:Landroid/support/v7/app/AppCompatViewInflater;
    :try_end_0
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_2

    :catch_0
    move-exception v2

    const-string v3, "AppCompatDelegate"

    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    const-string v5, "Failed to instantiate custom view inflater "

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v4, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v0, ". Falling back to default."

    invoke-virtual {v4, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v3, v0, v2}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I

    new-instance v0, Landroid/support/v7/app/AppCompatViewInflater;

    invoke-direct {v0}, Landroid/support/v7/app/AppCompatViewInflater;-><init>()V

    goto :goto_1

    :cond_1
    :goto_0
    new-instance v0, Landroid/support/v7/app/AppCompatViewInflater;

    invoke-direct {v0}, Landroid/support/v7/app/AppCompatViewInflater;-><init>()V

    :goto_1
    iput-object v0, p0, Landroid/support/v7/app/j;->L:Landroid/support/v7/app/AppCompatViewInflater;

    :cond_2
    :goto_2
    sget-boolean v0, Landroid/support/v7/app/j;->t:Z

    if-eqz v0, :cond_5

    instance-of v0, p4, Lorg/xmlpull/v1/XmlPullParser;

    const/4 v2, 0x1

    if-eqz v0, :cond_3

    move-object v0, p4

    check-cast v0, Lorg/xmlpull/v1/XmlPullParser;

    invoke-interface {v0}, Lorg/xmlpull/v1/XmlPullParser;->getDepth()I

    move-result v0

    if-le v0, v2, :cond_4

    const/4 v1, 0x1

    goto :goto_3

    :cond_3
    move-object v0, p1

    check-cast v0, Landroid/view/ViewParent;

    invoke-direct {p0, v0}, Landroid/support/v7/app/j;->a(Landroid/view/ViewParent;)Z

    move-result v0

    move v1, v0

    :cond_4
    :goto_3
    move v7, v1

    goto :goto_4

    :cond_5
    const/4 v7, 0x0

    :goto_4
    iget-object v2, p0, Landroid/support/v7/app/j;->L:Landroid/support/v7/app/AppCompatViewInflater;

    sget-boolean v8, Landroid/support/v7/app/j;->t:Z

    const/4 v9, 0x1

    invoke-static {}, Landroid/support/v7/widget/bb;->a()Z

    move-result v10

    move-object v3, p1

    move-object v4, p2

    move-object v5, p3

    move-object v6, p4

    invoke-virtual/range {v2 .. v10}, Landroid/support/v7/app/AppCompatViewInflater;->a(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;ZZZZ)Landroid/view/View;

    move-result-object p1

    return-object p1
.end method

.method public b(I)V
    .locals 2

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    const v1, 0x1020002

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    invoke-virtual {v0}, Landroid/view/ViewGroup;->removeAllViews()V

    iget-object v1, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-static {v1}, Landroid/view/LayoutInflater;->from(Landroid/content/Context;)Landroid/view/LayoutInflater;

    move-result-object v1

    invoke-virtual {v1, p1, v0}, Landroid/view/LayoutInflater;->inflate(ILandroid/view/ViewGroup;)Landroid/view/View;

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    invoke-interface {p1}, Landroid/view/Window$Callback;->onContentChanged()V

    return-void
.end method

.method public b(Landroid/os/Bundle;)V
    .locals 0

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    return-void
.end method

.method b(Landroid/support/v7/view/menu/h;)V
    .locals 2

    iget-boolean v0, p0, Landroid/support/v7/app/j;->D:Z

    if-eqz v0, :cond_0

    return-void

    :cond_0
    const/4 v0, 0x1

    iput-boolean v0, p0, Landroid/support/v7/app/j;->D:Z

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v0}, Landroid/support/v7/widget/ad;->k()V

    invoke-virtual {p0}, Landroid/support/v7/app/j;->q()Landroid/view/Window$Callback;

    move-result-object v0

    if-eqz v0, :cond_1

    invoke-virtual {p0}, Landroid/support/v7/app/j;->p()Z

    move-result v1

    if-nez v1, :cond_1

    const/16 v1, 0x6c

    invoke-interface {v0, v1, p1}, Landroid/view/Window$Callback;->onPanelClosed(ILandroid/view/Menu;)V

    :cond_1
    const/4 p1, 0x0

    iput-boolean p1, p0, Landroid/support/v7/app/j;->D:Z

    return-void
.end method

.method public b(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V
    .locals 2

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    const v1, 0x1020002

    invoke-virtual {v0, v1}, Landroid/view/ViewGroup;->findViewById(I)Landroid/view/View;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup;

    invoke-virtual {v0, p1, p2}, Landroid/view/ViewGroup;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    iget-object p1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    invoke-interface {p1}, Landroid/view/Window$Callback;->onContentChanged()V

    return-void
.end method

.method b(Ljava/lang/CharSequence;)V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v0, p1}, Landroid/support/v7/widget/ad;->setWindowTitle(Ljava/lang/CharSequence;)V

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Landroid/support/v7/app/j;->m()Landroid/support/v7/app/a;

    move-result-object v0

    if-eqz v0, :cond_1

    invoke-virtual {p0}, Landroid/support/v7/app/j;->m()Landroid/support/v7/app/a;

    move-result-object v0

    invoke-virtual {v0, p1}, Landroid/support/v7/app/a;->a(Ljava/lang/CharSequence;)V

    goto :goto_0

    :cond_1
    iget-object v0, p0, Landroid/support/v7/app/j;->z:Landroid/widget/TextView;

    if-eqz v0, :cond_2

    iget-object v0, p0, Landroid/support/v7/app/j;->z:Landroid/widget/TextView;

    invoke-virtual {v0, p1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    :cond_2
    :goto_0
    return-void
.end method

.method b(ILandroid/view/KeyEvent;)Z
    .locals 3

    const/4 v0, 0x4

    const/4 v1, 0x1

    const/4 v2, 0x0

    if-eq p1, v0, :cond_1

    const/16 v0, 0x52

    if-eq p1, v0, :cond_0

    goto :goto_0

    :cond_0
    invoke-direct {p0, v2, p2}, Landroid/support/v7/app/j;->e(ILandroid/view/KeyEvent;)Z

    return v1

    :cond_1
    iget-boolean p1, p0, Landroid/support/v7/app/j;->G:Z

    iput-boolean v2, p0, Landroid/support/v7/app/j;->G:Z

    invoke-virtual {p0, v2, v2}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p2

    if-eqz p2, :cond_3

    iget-boolean v0, p2, Landroid/support/v7/app/j$d;->o:Z

    if-eqz v0, :cond_3

    if-nez p1, :cond_2

    invoke-virtual {p0, p2, v1}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    :cond_2
    return v1

    :cond_3
    invoke-virtual {p0}, Landroid/support/v7/app/j;->u()Z

    move-result p1

    if-eqz p1, :cond_4

    return v1

    :cond_4
    :goto_0
    return v2
.end method

.method b(ILandroid/view/Menu;)Z
    .locals 0

    const/16 p2, 0x6c

    if-ne p1, p2, :cond_1

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object p1

    const/4 p2, 0x1

    if-eqz p1, :cond_0

    invoke-virtual {p1, p2}, Landroid/support/v7/app/a;->e(Z)V

    :cond_0
    return p2

    :cond_1
    const/4 p1, 0x0

    return p1
.end method

.method public c(I)Z
    .locals 3

    invoke-direct {p0, p1}, Landroid/support/v7/app/j;->h(I)I

    move-result p1

    iget-boolean v0, p0, Landroid/support/v7/app/j;->l:Z

    const/4 v1, 0x0

    if-eqz v0, :cond_0

    const/16 v0, 0x6c

    if-ne p1, v0, :cond_0

    return v1

    :cond_0
    iget-boolean v0, p0, Landroid/support/v7/app/j;->h:Z

    const/4 v2, 0x1

    if-eqz v0, :cond_1

    if-ne p1, v2, :cond_1

    iput-boolean v1, p0, Landroid/support/v7/app/j;->h:Z

    :cond_1
    sparse-switch p1, :sswitch_data_0

    iget-object v0, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v0, p1}, Landroid/view/Window;->requestFeature(I)Z

    move-result p1

    return p1

    :sswitch_0
    invoke-direct {p0}, Landroid/support/v7/app/j;->z()V

    iput-boolean v2, p0, Landroid/support/v7/app/j;->i:Z

    return v2

    :sswitch_1
    invoke-direct {p0}, Landroid/support/v7/app/j;->z()V

    iput-boolean v2, p0, Landroid/support/v7/app/j;->h:Z

    return v2

    :sswitch_2
    invoke-direct {p0}, Landroid/support/v7/app/j;->z()V

    iput-boolean v2, p0, Landroid/support/v7/app/j;->j:Z

    return v2

    :sswitch_3
    invoke-direct {p0}, Landroid/support/v7/app/j;->z()V

    iput-boolean v2, p0, Landroid/support/v7/app/j;->C:Z

    return v2

    :sswitch_4
    invoke-direct {p0}, Landroid/support/v7/app/j;->z()V

    iput-boolean v2, p0, Landroid/support/v7/app/j;->B:Z

    return v2

    :sswitch_5
    invoke-direct {p0}, Landroid/support/v7/app/j;->z()V

    iput-boolean v2, p0, Landroid/support/v7/app/j;->l:Z

    return v2

    nop

    :sswitch_data_0
    .sparse-switch
        0x1 -> :sswitch_5
        0x2 -> :sswitch_4
        0x5 -> :sswitch_3
        0xa -> :sswitch_2
        0x6c -> :sswitch_1
        0x6d -> :sswitch_0
    .end sparse-switch
.end method

.method c(ILandroid/view/KeyEvent;)Z
    .locals 3

    const/4 v0, 0x4

    const/4 v1, 0x1

    const/4 v2, 0x0

    if-eq p1, v0, :cond_1

    const/16 v0, 0x52

    if-eq p1, v0, :cond_0

    goto :goto_1

    :cond_0
    invoke-direct {p0, v2, p2}, Landroid/support/v7/app/j;->d(ILandroid/view/KeyEvent;)Z

    return v1

    :cond_1
    invoke-virtual {p2}, Landroid/view/KeyEvent;->getFlags()I

    move-result p1

    and-int/lit16 p1, p1, 0x80

    if-eqz p1, :cond_2

    goto :goto_0

    :cond_2
    const/4 v1, 0x0

    :goto_0
    iput-boolean v1, p0, Landroid/support/v7/app/j;->G:Z

    :goto_1
    return v2
.end method

.method public d()V
    .locals 2

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object v0

    if-eqz v0, :cond_0

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/support/v7/app/a;->d(Z)V

    :cond_0
    return-void
.end method

.method public e()V
    .locals 2

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object v0

    if-eqz v0, :cond_0

    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/support/v7/app/a;->d(Z)V

    :cond_0
    return-void
.end method

.method e(I)V
    .locals 1

    const/4 v0, 0x1

    invoke-virtual {p0, p1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object p1

    invoke-virtual {p0, p1, v0}, Landroid/support/v7/app/j;->a(Landroid/support/v7/app/j$d;Z)V

    return-void
.end method

.method public f()V
    .locals 1

    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object v0

    if-eqz v0, :cond_0

    invoke-virtual {v0}, Landroid/support/v7/app/a;->e()Z

    move-result v0

    if-eqz v0, :cond_0

    return-void

    :cond_0
    const/4 v0, 0x0

    invoke-direct {p0, v0}, Landroid/support/v7/app/j;->d(I)V

    return-void
.end method

.method f(I)V
    .locals 4

    const/4 v0, 0x1

    invoke-virtual {p0, p1, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object v1

    iget-object v2, v1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-eqz v2, :cond_1

    new-instance v2, Landroid/os/Bundle;

    invoke-direct {v2}, Landroid/os/Bundle;-><init>()V

    iget-object v3, v1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v3, v2}, Landroid/support/v7/view/menu/h;->a(Landroid/os/Bundle;)V

    invoke-virtual {v2}, Landroid/os/Bundle;->size()I

    move-result v3

    if-lez v3, :cond_0

    iput-object v2, v1, Landroid/support/v7/app/j$d;->s:Landroid/os/Bundle;

    :cond_0
    iget-object v2, v1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v2}, Landroid/support/v7/view/menu/h;->g()V

    iget-object v2, v1, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v2}, Landroid/support/v7/view/menu/h;->clear()V

    :cond_1
    iput-boolean v0, v1, Landroid/support/v7/app/j$d;->r:Z

    iput-boolean v0, v1, Landroid/support/v7/app/j$d;->q:Z

    const/16 v0, 0x6c

    if-eq p1, v0, :cond_2

    if-nez p1, :cond_3

    :cond_2
    iget-object p1, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz p1, :cond_3

    const/4 p1, 0x0

    invoke-virtual {p0, p1, p1}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object v0

    if-eqz v0, :cond_3

    iput-boolean p1, v0, Landroid/support/v7/app/j$d;->m:Z

    const/4 p1, 0x0

    invoke-direct {p0, v0, p1}, Landroid/support/v7/app/j;->b(Landroid/support/v7/app/j$d;Landroid/view/KeyEvent;)Z

    :cond_3
    return-void
.end method

.method g(I)I
    .locals 7

    iget-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    const/4 v1, 0x0

    if-eqz v0, :cond_9

    iget-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v0}, Landroid/support/v7/widget/ActionBarContextView;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v0

    instance-of v0, v0, Landroid/view/ViewGroup$MarginLayoutParams;

    if-eqz v0, :cond_9

    iget-object v0, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v0}, Landroid/support/v7/widget/ActionBarContextView;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v0

    check-cast v0, Landroid/view/ViewGroup$MarginLayoutParams;

    iget-object v2, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v2}, Landroid/support/v7/widget/ActionBarContextView;->isShown()Z

    move-result v2

    const/4 v3, 0x1

    if-eqz v2, :cond_6

    iget-object v2, p0, Landroid/support/v7/app/j;->J:Landroid/graphics/Rect;

    if-nez v2, :cond_0

    new-instance v2, Landroid/graphics/Rect;

    invoke-direct {v2}, Landroid/graphics/Rect;-><init>()V

    iput-object v2, p0, Landroid/support/v7/app/j;->J:Landroid/graphics/Rect;

    new-instance v2, Landroid/graphics/Rect;

    invoke-direct {v2}, Landroid/graphics/Rect;-><init>()V

    iput-object v2, p0, Landroid/support/v7/app/j;->K:Landroid/graphics/Rect;

    :cond_0
    iget-object v2, p0, Landroid/support/v7/app/j;->J:Landroid/graphics/Rect;

    iget-object v4, p0, Landroid/support/v7/app/j;->K:Landroid/graphics/Rect;

    invoke-virtual {v2, v1, p1, v1, v1}, Landroid/graphics/Rect;->set(IIII)V

    iget-object v5, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    invoke-static {v5, v2, v4}, Landroid/support/v7/widget/bc;->a(Landroid/view/View;Landroid/graphics/Rect;Landroid/graphics/Rect;)V

    iget v2, v4, Landroid/graphics/Rect;->top:I

    if-nez v2, :cond_1

    move v2, p1

    goto :goto_0

    :cond_1
    const/4 v2, 0x0

    :goto_0
    iget v4, v0, Landroid/view/ViewGroup$MarginLayoutParams;->topMargin:I

    if-eq v4, v2, :cond_4

    iput p1, v0, Landroid/view/ViewGroup$MarginLayoutParams;->topMargin:I

    iget-object v2, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    if-nez v2, :cond_2

    new-instance v2, Landroid/view/View;

    iget-object v4, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-direct {v2, v4}, Landroid/view/View;-><init>(Landroid/content/Context;)V

    iput-object v2, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    iget-object v2, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    iget-object v4, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-virtual {v4}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v4

    sget v5, Landroid/support/v7/a/a$c;->abc_input_method_navigation_guard:I

    invoke-virtual {v4, v5}, Landroid/content/res/Resources;->getColor(I)I

    move-result v4

    invoke-virtual {v2, v4}, Landroid/view/View;->setBackgroundColor(I)V

    iget-object v2, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    iget-object v4, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    new-instance v5, Landroid/view/ViewGroup$LayoutParams;

    const/4 v6, -0x1

    invoke-direct {v5, v6, p1}, Landroid/view/ViewGroup$LayoutParams;-><init>(II)V

    invoke-virtual {v2, v4, v6, v5}, Landroid/view/ViewGroup;->addView(Landroid/view/View;ILandroid/view/ViewGroup$LayoutParams;)V

    goto :goto_1

    :cond_2
    iget-object v2, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    invoke-virtual {v2}, Landroid/view/View;->getLayoutParams()Landroid/view/ViewGroup$LayoutParams;

    move-result-object v2

    iget v4, v2, Landroid/view/ViewGroup$LayoutParams;->height:I

    if-eq v4, p1, :cond_3

    iput p1, v2, Landroid/view/ViewGroup$LayoutParams;->height:I

    iget-object v4, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    invoke-virtual {v4, v2}, Landroid/view/View;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    :cond_3
    :goto_1
    const/4 v2, 0x1

    goto :goto_2

    :cond_4
    const/4 v2, 0x0

    :goto_2
    iget-object v4, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    if-eqz v4, :cond_5

    goto :goto_3

    :cond_5
    const/4 v3, 0x0

    :goto_3
    iget-boolean v4, p0, Landroid/support/v7/app/j;->j:Z

    if-nez v4, :cond_8

    if-eqz v3, :cond_8

    const/4 p1, 0x0

    goto :goto_5

    :cond_6
    iget v2, v0, Landroid/view/ViewGroup$MarginLayoutParams;->topMargin:I

    if-eqz v2, :cond_7

    iput v1, v0, Landroid/view/ViewGroup$MarginLayoutParams;->topMargin:I

    const/4 v2, 0x1

    goto :goto_4

    :cond_7
    const/4 v2, 0x0

    :goto_4
    const/4 v3, 0x0

    :cond_8
    :goto_5
    if-eqz v2, :cond_a

    iget-object v2, p0, Landroid/support/v7/app/j;->n:Landroid/support/v7/widget/ActionBarContextView;

    invoke-virtual {v2, v0}, Landroid/support/v7/widget/ActionBarContextView;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    goto :goto_6

    :cond_9
    const/4 v3, 0x0

    :cond_a
    :goto_6
    iget-object v0, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    if-eqz v0, :cond_c

    iget-object v0, p0, Landroid/support/v7/app/j;->A:Landroid/view/View;

    if-eqz v3, :cond_b

    goto :goto_7

    :cond_b
    const/16 v1, 0x8

    :goto_7
    invoke-virtual {v0, v1}, Landroid/view/View;->setVisibility(I)V

    :cond_c
    return p1
.end method

.method public g()V
    .locals 2

    iget-boolean v0, p0, Landroid/support/v7/app/j;->r:Z

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v0}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v0

    iget-object v1, p0, Landroid/support/v7/app/j;->H:Ljava/lang/Runnable;

    invoke-virtual {v0, v1}, Landroid/view/View;->removeCallbacks(Ljava/lang/Runnable;)Z

    :cond_0
    invoke-super {p0}, Landroid/support/v7/app/f;->g()V

    iget-object v0, p0, Landroid/support/v7/app/j;->f:Landroid/support/v7/app/a;

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/app/j;->f:Landroid/support/v7/app/a;

    invoke-virtual {v0}, Landroid/support/v7/app/a;->g()V

    :cond_1
    return-void
.end method

.method public h()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/app/j;->a:Landroid/content/Context;

    invoke-static {v0}, Landroid/view/LayoutInflater;->from(Landroid/content/Context;)Landroid/view/LayoutInflater;

    move-result-object v0

    invoke-virtual {v0}, Landroid/view/LayoutInflater;->getFactory()Landroid/view/LayoutInflater$Factory;

    move-result-object v1

    if-nez v1, :cond_0

    invoke-static {v0, p0}, Landroid/support/v4/g/e;->b(Landroid/view/LayoutInflater;Landroid/view/LayoutInflater$Factory2;)V

    goto :goto_0

    :cond_0
    invoke-virtual {v0}, Landroid/view/LayoutInflater;->getFactory2()Landroid/view/LayoutInflater$Factory2;

    move-result-object v0

    instance-of v0, v0, Landroid/support/v7/app/j;

    if-nez v0, :cond_1

    const-string v0, "AppCompatDelegate"

    const-string v1, "The Activity\'s LayoutInflater already has a Factory installed so we can not install AppCompat\'s"

    invoke-static {v0, v1}, Landroid/util/Log;->i(Ljava/lang/String;Ljava/lang/String;)I

    :cond_1
    :goto_0
    return-void
.end method

.method public l()V
    .locals 3

    invoke-direct {p0}, Landroid/support/v7/app/j;->w()V

    iget-boolean v0, p0, Landroid/support/v7/app/j;->h:Z

    if-eqz v0, :cond_3

    iget-object v0, p0, Landroid/support/v7/app/j;->f:Landroid/support/v7/app/a;

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    iget-object v0, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    instance-of v0, v0, Landroid/app/Activity;

    if-eqz v0, :cond_1

    new-instance v0, Landroid/support/v7/app/p;

    iget-object v1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    check-cast v1, Landroid/app/Activity;

    iget-boolean v2, p0, Landroid/support/v7/app/j;->i:Z

    invoke-direct {v0, v1, v2}, Landroid/support/v7/app/p;-><init>(Landroid/app/Activity;Z)V

    :goto_0
    iput-object v0, p0, Landroid/support/v7/app/j;->f:Landroid/support/v7/app/a;

    goto :goto_1

    :cond_1
    iget-object v0, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    instance-of v0, v0, Landroid/app/Dialog;

    if-eqz v0, :cond_2

    new-instance v0, Landroid/support/v7/app/p;

    iget-object v1, p0, Landroid/support/v7/app/j;->c:Landroid/view/Window$Callback;

    check-cast v1, Landroid/app/Dialog;

    invoke-direct {v0, v1}, Landroid/support/v7/app/p;-><init>(Landroid/app/Dialog;)V

    goto :goto_0

    :cond_2
    :goto_1
    iget-object v0, p0, Landroid/support/v7/app/j;->f:Landroid/support/v7/app/a;

    if-eqz v0, :cond_3

    iget-object v0, p0, Landroid/support/v7/app/j;->f:Landroid/support/v7/app/a;

    iget-boolean v1, p0, Landroid/support/v7/app/j;->I:Z

    invoke-virtual {v0, v1}, Landroid/support/v7/app/a;->c(Z)V

    :cond_3
    :goto_2
    return-void
.end method

.method public final onCreateView(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;
    .locals 1

    invoke-virtual {p0, p1, p2, p3, p4}, Landroid/support/v7/app/j;->a(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;

    move-result-object v0

    if-eqz v0, :cond_0

    return-object v0

    :cond_0
    invoke-virtual {p0, p1, p2, p3, p4}, Landroid/support/v7/app/j;->b(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;

    move-result-object p1

    return-object p1
.end method

.method public onCreateView(Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;
    .locals 1

    const/4 v0, 0x0

    invoke-virtual {p0, v0, p1, p2, p3}, Landroid/support/v7/app/j;->onCreateView(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;

    move-result-object p1

    return-object p1
.end method

.method final s()Z
    .locals 1

    iget-boolean v0, p0, Landroid/support/v7/app/j;->x:Z

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->y:Landroid/view/ViewGroup;

    invoke-static {v0}, Landroid/support/v4/g/p;->l(Landroid/view/View;)Z

    move-result v0

    if-eqz v0, :cond_0

    const/4 v0, 0x1

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    return v0
.end method

.method t()V
    .locals 1

    iget-object v0, p0, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->q:Landroid/support/v4/g/s;

    invoke-virtual {v0}, Landroid/support/v4/g/s;->b()V

    :cond_0
    return-void
.end method

.method u()Z
    .locals 2

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    const/4 v1, 0x1

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->m:Landroid/support/v7/view/b;

    invoke-virtual {v0}, Landroid/support/v7/view/b;->c()V

    return v1

    :cond_0
    invoke-virtual {p0}, Landroid/support/v7/app/j;->a()Landroid/support/v7/app/a;

    move-result-object v0

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Landroid/support/v7/app/a;->f()Z

    move-result v0

    if-eqz v0, :cond_1

    return v1

    :cond_1
    const/4 v0, 0x0

    return v0
.end method

.method v()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/j;->u:Landroid/support/v7/widget/ad;

    invoke-interface {v0}, Landroid/support/v7/widget/ad;->k()V

    :cond_0
    iget-object v0, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    if-eqz v0, :cond_2

    iget-object v0, p0, Landroid/support/v7/app/j;->b:Landroid/view/Window;

    invoke-virtual {v0}, Landroid/view/Window;->getDecorView()Landroid/view/View;

    move-result-object v0

    iget-object v1, p0, Landroid/support/v7/app/j;->p:Ljava/lang/Runnable;

    invoke-virtual {v0, v1}, Landroid/view/View;->removeCallbacks(Ljava/lang/Runnable;)Z

    iget-object v0, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    invoke-virtual {v0}, Landroid/widget/PopupWindow;->isShowing()Z

    move-result v0

    if-eqz v0, :cond_1

    :try_start_0
    iget-object v0, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    invoke-virtual {v0}, Landroid/widget/PopupWindow;->dismiss()V
    :try_end_0
    .catch Ljava/lang/IllegalArgumentException; {:try_start_0 .. :try_end_0} :catch_0

    :catch_0
    :cond_1
    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/v7/app/j;->o:Landroid/widget/PopupWindow;

    :cond_2
    invoke-virtual {p0}, Landroid/support/v7/app/j;->t()V

    const/4 v0, 0x0

    invoke-virtual {p0, v0, v0}, Landroid/support/v7/app/j;->a(IZ)Landroid/support/v7/app/j$d;

    move-result-object v0

    if-eqz v0, :cond_3

    iget-object v1, v0, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    if-eqz v1, :cond_3

    iget-object v0, v0, Landroid/support/v7/app/j$d;->j:Landroid/support/v7/view/menu/h;

    invoke-virtual {v0}, Landroid/support/v7/view/menu/h;->close()V

    :cond_3
    return-void
.end method
