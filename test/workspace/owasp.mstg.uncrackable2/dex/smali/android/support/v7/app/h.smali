.class Landroid/support/v7/app/h;
.super Landroid/support/v7/app/j;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/support/v7/app/h$b;,
        Landroid/support/v7/app/h$a;
    }
.end annotation


# instance fields
.field private t:I

.field private u:Z

.field private v:Z

.field private w:Landroid/support/v7/app/h$b;


# direct methods
.method constructor <init>(Landroid/content/Context;Landroid/view/Window;Landroid/support/v7/app/d;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Landroid/support/v7/app/j;-><init>(Landroid/content/Context;Landroid/view/Window;Landroid/support/v7/app/d;)V

    const/16 p1, -0x64

    iput p1, p0, Landroid/support/v7/app/h;->t:I

    const/4 p1, 0x1

    iput-boolean p1, p0, Landroid/support/v7/app/h;->v:Z

    return-void
.end method

.method private h(I)Z
    .locals 4

    iget-object v0, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    invoke-virtual {v0}, Landroid/content/Context;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    invoke-virtual {v0}, Landroid/content/res/Resources;->getConfiguration()Landroid/content/res/Configuration;

    move-result-object v1

    iget v2, v1, Landroid/content/res/Configuration;->uiMode:I

    and-int/lit8 v2, v2, 0x30

    const/4 v3, 0x2

    if-ne p1, v3, :cond_0

    const/16 p1, 0x20

    goto :goto_0

    :cond_0
    const/16 p1, 0x10

    :goto_0
    if-eq v2, p1, :cond_3

    invoke-direct {p0}, Landroid/support/v7/app/h;->y()Z

    move-result v2

    if-eqz v2, :cond_1

    iget-object p1, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    check-cast p1, Landroid/app/Activity;

    invoke-virtual {p1}, Landroid/app/Activity;->recreate()V

    goto :goto_1

    :cond_1
    new-instance v2, Landroid/content/res/Configuration;

    invoke-direct {v2, v1}, Landroid/content/res/Configuration;-><init>(Landroid/content/res/Configuration;)V

    invoke-virtual {v0}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;

    move-result-object v1

    iget v3, v2, Landroid/content/res/Configuration;->uiMode:I

    and-int/lit8 v3, v3, -0x31

    or-int/2addr p1, v3

    iput p1, v2, Landroid/content/res/Configuration;->uiMode:I

    invoke-virtual {v0, v2, v1}, Landroid/content/res/Resources;->updateConfiguration(Landroid/content/res/Configuration;Landroid/util/DisplayMetrics;)V

    sget p1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x1a

    if-ge p1, v1, :cond_2

    invoke-static {v0}, Landroid/support/v7/app/l;->a(Landroid/content/res/Resources;)Z

    :cond_2
    :goto_1
    const/4 p1, 0x1

    return p1

    :cond_3
    const/4 p1, 0x0

    return p1
.end method

.method private w()I
    .locals 2

    iget v0, p0, Landroid/support/v7/app/h;->t:I

    const/16 v1, -0x64

    if-eq v0, v1, :cond_0

    iget v0, p0, Landroid/support/v7/app/h;->t:I

    goto :goto_0

    :cond_0
    invoke-static {}, Landroid/support/v7/app/h;->j()I

    move-result v0

    :goto_0
    return v0
.end method

.method private x()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v7/app/h$b;

    iget-object v1, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    invoke-static {v1}, Landroid/support/v7/app/o;->a(Landroid/content/Context;)Landroid/support/v7/app/o;

    move-result-object v1

    invoke-direct {v0, p0, v1}, Landroid/support/v7/app/h$b;-><init>(Landroid/support/v7/app/h;Landroid/support/v7/app/o;)V

    iput-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    :cond_0
    return-void
.end method

.method private y()Z
    .locals 6

    iget-boolean v0, p0, Landroid/support/v7/app/h;->u:Z

    const/4 v1, 0x0

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    instance-of v0, v0, Landroid/app/Activity;

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    invoke-virtual {v0}, Landroid/content/Context;->getPackageManager()Landroid/content/pm/PackageManager;

    move-result-object v0

    const/4 v2, 0x1

    :try_start_0
    new-instance v3, Landroid/content/ComponentName;

    iget-object v4, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    iget-object v5, p0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    invoke-virtual {v5}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v5

    invoke-direct {v3, v4, v5}, Landroid/content/ComponentName;-><init>(Landroid/content/Context;Ljava/lang/Class;)V

    invoke-virtual {v0, v3, v1}, Landroid/content/pm/PackageManager;->getActivityInfo(Landroid/content/ComponentName;I)Landroid/content/pm/ActivityInfo;

    move-result-object v0

    iget v0, v0, Landroid/content/pm/ActivityInfo;->configChanges:I
    :try_end_0
    .catch Landroid/content/pm/PackageManager$NameNotFoundException; {:try_start_0 .. :try_end_0} :catch_0

    and-int/lit16 v0, v0, 0x200

    if-nez v0, :cond_0

    const/4 v1, 0x1

    :cond_0
    return v1

    :catch_0
    move-exception v0

    const-string v1, "AppCompatDelegate"

    const-string v3, "Exception while getting ActivityInfo"

    invoke-static {v1, v3, v0}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;Ljava/lang/Throwable;)I

    return v2

    :cond_1
    return v1
.end method


# virtual methods
.method a(Landroid/view/View;Ljava/lang/String;Landroid/content/Context;Landroid/util/AttributeSet;)Landroid/view/View;
    .locals 0

    const/4 p1, 0x0

    return-object p1
.end method

.method a(Landroid/view/Window$Callback;)Landroid/view/Window$Callback;
    .locals 1

    new-instance v0, Landroid/support/v7/app/h$a;

    invoke-direct {v0, p0, p1}, Landroid/support/v7/app/h$a;-><init>(Landroid/support/v7/app/h;Landroid/view/Window$Callback;)V

    return-object v0
.end method

.method public a(Landroid/os/Bundle;)V
    .locals 2

    invoke-super {p0, p1}, Landroid/support/v7/app/j;->a(Landroid/os/Bundle;)V

    if-eqz p1, :cond_0

    iget v0, p0, Landroid/support/v7/app/h;->t:I

    const/16 v1, -0x64

    if-ne v0, v1, :cond_0

    const-string v0, "appcompat:local_night_mode"

    invoke-virtual {p1, v0, v1}, Landroid/os/Bundle;->getInt(Ljava/lang/String;I)I

    move-result p1

    iput p1, p0, Landroid/support/v7/app/h;->t:I

    :cond_0
    return-void
.end method

.method public c()V
    .locals 0

    invoke-super {p0}, Landroid/support/v7/app/j;->c()V

    invoke-virtual {p0}, Landroid/support/v7/app/h;->i()Z

    return-void
.end method

.method public c(Landroid/os/Bundle;)V
    .locals 2

    invoke-super {p0, p1}, Landroid/support/v7/app/j;->c(Landroid/os/Bundle;)V

    iget v0, p0, Landroid/support/v7/app/h;->t:I

    const/16 v1, -0x64

    if-eq v0, v1, :cond_0

    const-string v0, "appcompat:local_night_mode"

    iget v1, p0, Landroid/support/v7/app/h;->t:I

    invoke-virtual {p1, v0, v1}, Landroid/os/Bundle;->putInt(Ljava/lang/String;I)V

    :cond_0
    return-void
.end method

.method d(I)I
    .locals 1

    const/16 v0, -0x64

    if-eq p1, v0, :cond_1

    if-eqz p1, :cond_0

    return p1

    :cond_0
    invoke-direct {p0}, Landroid/support/v7/app/h;->x()V

    iget-object p1, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    invoke-virtual {p1}, Landroid/support/v7/app/h$b;->a()I

    move-result p1

    return p1

    :cond_1
    const/4 p1, -0x1

    return p1
.end method

.method public d()V
    .locals 1

    invoke-super {p0}, Landroid/support/v7/app/j;->d()V

    iget-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    invoke-virtual {v0}, Landroid/support/v7/app/h$b;->d()V

    :cond_0
    return-void
.end method

.method public g()V
    .locals 1

    invoke-super {p0}, Landroid/support/v7/app/j;->g()V

    iget-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    invoke-virtual {v0}, Landroid/support/v7/app/h$b;->d()V

    :cond_0
    return-void
.end method

.method public i()Z
    .locals 3

    invoke-direct {p0}, Landroid/support/v7/app/h;->w()I

    move-result v0

    invoke-virtual {p0, v0}, Landroid/support/v7/app/h;->d(I)I

    move-result v1

    const/4 v2, -0x1

    if-eq v1, v2, :cond_0

    invoke-direct {p0, v1}, Landroid/support/v7/app/h;->h(I)Z

    move-result v1

    goto :goto_0

    :cond_0
    const/4 v1, 0x0

    :goto_0
    if-nez v0, :cond_1

    invoke-direct {p0}, Landroid/support/v7/app/h;->x()V

    iget-object v0, p0, Landroid/support/v7/app/h;->w:Landroid/support/v7/app/h$b;

    invoke-virtual {v0}, Landroid/support/v7/app/h$b;->c()V

    :cond_1
    const/4 v0, 0x1

    iput-boolean v0, p0, Landroid/support/v7/app/h;->u:Z

    return v1
.end method

.method public o()Z
    .locals 1

    iget-boolean v0, p0, Landroid/support/v7/app/h;->v:Z

    return v0
.end method
