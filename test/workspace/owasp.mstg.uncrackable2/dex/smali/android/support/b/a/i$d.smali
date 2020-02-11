.class Landroid/support/b/a/i$d;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/b/a/i;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0xa
    name = "d"
.end annotation


# instance fields
.field protected m:[Landroid/support/v4/b/b$b;

.field n:Ljava/lang/String;

.field o:I


# direct methods
.method public constructor <init>()V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    return-void
.end method

.method public constructor <init>(Landroid/support/b/a/i$d;)V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    iget-object v0, p1, Landroid/support/b/a/i$d;->n:Ljava/lang/String;

    iput-object v0, p0, Landroid/support/b/a/i$d;->n:Ljava/lang/String;

    iget v0, p1, Landroid/support/b/a/i$d;->o:I

    iput v0, p0, Landroid/support/b/a/i$d;->o:I

    iget-object p1, p1, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    invoke-static {p1}, Landroid/support/v4/b/b;->a([Landroid/support/v4/b/b$b;)[Landroid/support/v4/b/b$b;

    move-result-object p1

    iput-object p1, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    return-void
.end method


# virtual methods
.method public a(Landroid/graphics/Path;)V
    .locals 1

    invoke-virtual {p1}, Landroid/graphics/Path;->reset()V

    iget-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    invoke-static {v0, p1}, Landroid/support/v4/b/b$b;->a([Landroid/support/v4/b/b$b;Landroid/graphics/Path;)V

    :cond_0
    return-void
.end method

.method public a()Z
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public getPathData()[Landroid/support/v4/b/b$b;
    .locals 1

    iget-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    return-object v0
.end method

.method public getPathName()Ljava/lang/String;
    .locals 1

    iget-object v0, p0, Landroid/support/b/a/i$d;->n:Ljava/lang/String;

    return-object v0
.end method

.method public setPathData([Landroid/support/v4/b/b$b;)V
    .locals 1

    iget-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    invoke-static {v0, p1}, Landroid/support/v4/b/b;->a([Landroid/support/v4/b/b$b;[Landroid/support/v4/b/b$b;)Z

    move-result v0

    if-nez v0, :cond_0

    invoke-static {p1}, Landroid/support/v4/b/b;->a([Landroid/support/v4/b/b$b;)[Landroid/support/v4/b/b$b;

    move-result-object p1

    iput-object p1, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    goto :goto_0

    :cond_0
    iget-object v0, p0, Landroid/support/b/a/i$d;->m:[Landroid/support/v4/b/b$b;

    invoke-static {v0, p1}, Landroid/support/v4/b/b;->b([Landroid/support/v4/b/b$b;[Landroid/support/v4/b/b$b;)V

    :goto_0
    return-void
.end method
