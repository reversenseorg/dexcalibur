.class public final Landroid/support/v4/g/q;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/support/v4/g/q$b;,
        Landroid/support/v4/g/q$a;,
        Landroid/support/v4/g/q$c;
    }
.end annotation


# static fields
.field static final a:Landroid/support/v4/g/q$c;


# direct methods
.method static constructor <clinit>()V
    .locals 2

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x15

    if-lt v0, v1, :cond_0

    new-instance v0, Landroid/support/v4/g/q$b;

    invoke-direct {v0}, Landroid/support/v4/g/q$b;-><init>()V

    :goto_0
    sput-object v0, Landroid/support/v4/g/q;->a:Landroid/support/v4/g/q$c;

    goto :goto_1

    :cond_0
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x12

    if-lt v0, v1, :cond_1

    new-instance v0, Landroid/support/v4/g/q$a;

    invoke-direct {v0}, Landroid/support/v4/g/q$a;-><init>()V

    goto :goto_0

    :cond_1
    new-instance v0, Landroid/support/v4/g/q$c;

    invoke-direct {v0}, Landroid/support/v4/g/q$c;-><init>()V

    goto :goto_0

    :goto_1
    return-void
.end method

.method public static a(Landroid/view/ViewGroup;)Z
    .locals 1

    sget-object v0, Landroid/support/v4/g/q;->a:Landroid/support/v4/g/q$c;

    invoke-virtual {v0, p0}, Landroid/support/v4/g/q$c;->a(Landroid/view/ViewGroup;)Z

    move-result p0

    return p0
.end method
