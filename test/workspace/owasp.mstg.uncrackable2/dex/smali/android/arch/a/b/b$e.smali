.class abstract Landroid/arch/a/b/b$e;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/arch/a/b/b$f;
.implements Ljava/util/Iterator;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/arch/a/b/b;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x40a
    name = "e"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "<K:",
        "Ljava/lang/Object;",
        "V:",
        "Ljava/lang/Object;",
        ">",
        "Ljava/lang/Object;",
        "Landroid/arch/a/b/b$f<",
        "TK;TV;>;",
        "Ljava/util/Iterator<",
        "Ljava/util/Map$Entry<",
        "TK;TV;>;>;"
    }
.end annotation


# instance fields
.field a:Landroid/arch/a/b/b$c;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;"
        }
    .end annotation
.end field

.field b:Landroid/arch/a/b/b$c;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;"
        }
    .end annotation
.end field


# direct methods
.method constructor <init>(Landroid/arch/a/b/b$c;Landroid/arch/a/b/b$c;)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;)V"
        }
    .end annotation

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p2, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    iput-object p1, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    return-void
.end method

.method private b()Landroid/arch/a/b/b$c;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;"
        }
    .end annotation

    iget-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    iget-object v1, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    if-eq v0, v1, :cond_1

    iget-object v0, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    if-nez v0, :cond_0

    goto :goto_0

    :cond_0
    iget-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    invoke-virtual {p0, v0}, Landroid/arch/a/b/b$e;->a(Landroid/arch/a/b/b$c;)Landroid/arch/a/b/b$c;

    move-result-object v0

    return-object v0

    :cond_1
    :goto_0
    const/4 v0, 0x0

    return-object v0
.end method


# virtual methods
.method abstract a(Landroid/arch/a/b/b$c;)Landroid/arch/a/b/b$c;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;)",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;"
        }
    .end annotation
.end method

.method public a()Ljava/util/Map$Entry;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Map$Entry<",
            "TK;TV;>;"
        }
    .end annotation

    iget-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    invoke-direct {p0}, Landroid/arch/a/b/b$e;->b()Landroid/arch/a/b/b$c;

    move-result-object v1

    iput-object v1, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    return-object v0
.end method

.method public a_(Landroid/arch/a/b/b$c;)V
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;)V"
        }
    .end annotation

    iget-object v0, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    if-ne v0, p1, :cond_0

    iget-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    if-ne p1, v0, :cond_0

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    iput-object v0, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    :cond_0
    iget-object v0, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    if-ne v0, p1, :cond_1

    iget-object v0, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    invoke-virtual {p0, v0}, Landroid/arch/a/b/b$e;->b(Landroid/arch/a/b/b$c;)Landroid/arch/a/b/b$c;

    move-result-object v0

    iput-object v0, p0, Landroid/arch/a/b/b$e;->a:Landroid/arch/a/b/b$c;

    :cond_1
    iget-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    if-ne v0, p1, :cond_2

    invoke-direct {p0}, Landroid/arch/a/b/b$e;->b()Landroid/arch/a/b/b$c;

    move-result-object p1

    iput-object p1, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    :cond_2
    return-void
.end method

.method abstract b(Landroid/arch/a/b/b$c;)Landroid/arch/a/b/b$c;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;)",
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;"
        }
    .end annotation
.end method

.method public hasNext()Z
    .locals 1

    iget-object v0, p0, Landroid/arch/a/b/b$e;->b:Landroid/arch/a/b/b$c;

    if-eqz v0, :cond_0

    const/4 v0, 0x1

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    return v0
.end method

.method public synthetic next()Ljava/lang/Object;
    .locals 1

    invoke-virtual {p0}, Landroid/arch/a/b/b$e;->a()Ljava/util/Map$Entry;

    move-result-object v0

    return-object v0
.end method
