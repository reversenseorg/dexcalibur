.class Landroid/arch/a/b/b$d;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/arch/a/b/b$f;
.implements Ljava/util/Iterator;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/arch/a/b/b;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x2
    name = "d"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Object;",
        "Landroid/arch/a/b/b$f<",
        "TK;TV;>;",
        "Ljava/util/Iterator<",
        "Ljava/util/Map$Entry<",
        "TK;TV;>;>;"
    }
.end annotation


# instance fields
.field final synthetic a:Landroid/arch/a/b/b;

.field private b:Landroid/arch/a/b/b$c;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroid/arch/a/b/b$c<",
            "TK;TV;>;"
        }
    .end annotation
.end field

.field private c:Z


# direct methods
.method private constructor <init>(Landroid/arch/a/b/b;)V
    .locals 0

    iput-object p1, p0, Landroid/arch/a/b/b$d;->a:Landroid/arch/a/b/b;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const/4 p1, 0x1

    iput-boolean p1, p0, Landroid/arch/a/b/b$d;->c:Z

    return-void
.end method

.method synthetic constructor <init>(Landroid/arch/a/b/b;Landroid/arch/a/b/b$1;)V
    .locals 0

    invoke-direct {p0, p1}, Landroid/arch/a/b/b$d;-><init>(Landroid/arch/a/b/b;)V

    return-void
.end method


# virtual methods
.method public a()Ljava/util/Map$Entry;
    .locals 1
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/Map$Entry<",
            "TK;TV;>;"
        }
    .end annotation

    iget-boolean v0, p0, Landroid/arch/a/b/b$d;->c:Z

    if-eqz v0, :cond_0

    const/4 v0, 0x0

    iput-boolean v0, p0, Landroid/arch/a/b/b$d;->c:Z

    iget-object v0, p0, Landroid/arch/a/b/b$d;->a:Landroid/arch/a/b/b;

    invoke-static {v0}, Landroid/arch/a/b/b;->a(Landroid/arch/a/b/b;)Landroid/arch/a/b/b$c;

    move-result-object v0

    :goto_0
    iput-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    goto :goto_1

    :cond_0
    iget-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    iget-object v0, v0, Landroid/arch/a/b/b$c;->c:Landroid/arch/a/b/b$c;

    goto :goto_0

    :cond_1
    const/4 v0, 0x0

    goto :goto_0

    :goto_1
    iget-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

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

    iget-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    if-ne p1, v0, :cond_1

    iget-object p1, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    iget-object p1, p1, Landroid/arch/a/b/b$c;->d:Landroid/arch/a/b/b$c;

    iput-object p1, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    iget-object p1, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    if-nez p1, :cond_0

    const/4 p1, 0x1

    goto :goto_0

    :cond_0
    const/4 p1, 0x0

    :goto_0
    iput-boolean p1, p0, Landroid/arch/a/b/b$d;->c:Z

    :cond_1
    return-void
.end method

.method public hasNext()Z
    .locals 3

    iget-boolean v0, p0, Landroid/arch/a/b/b$d;->c:Z

    const/4 v1, 0x0

    const/4 v2, 0x1

    if-eqz v0, :cond_1

    iget-object v0, p0, Landroid/arch/a/b/b$d;->a:Landroid/arch/a/b/b;

    invoke-static {v0}, Landroid/arch/a/b/b;->a(Landroid/arch/a/b/b;)Landroid/arch/a/b/b$c;

    move-result-object v0

    if-eqz v0, :cond_0

    const/4 v1, 0x1

    :cond_0
    return v1

    :cond_1
    iget-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    if-eqz v0, :cond_2

    iget-object v0, p0, Landroid/arch/a/b/b$d;->b:Landroid/arch/a/b/b$c;

    iget-object v0, v0, Landroid/arch/a/b/b$c;->c:Landroid/arch/a/b/b$c;

    if-eqz v0, :cond_2

    const/4 v1, 0x1

    :cond_2
    return v1
.end method

.method public synthetic next()Ljava/lang/Object;
    .locals 1

    invoke-virtual {p0}, Landroid/arch/a/b/b$d;->a()Ljava/util/Map$Entry;

    move-result-object v0

    return-object v0
.end method
