.class public Landroid/support/v4/app/a;
.super Landroid/support/v4/a/a;


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/support/v4/app/a$a;
    }
.end annotation


# static fields
.field private static a:Landroid/support/v4/app/a$a;


# direct methods
.method public static a()Landroid/support/v4/app/a$a;
    .locals 1

    sget-object v0, Landroid/support/v4/app/a;->a:Landroid/support/v4/app/a$a;

    return-object v0
.end method

.method public static a(Landroid/app/Activity;)V
    .locals 2

    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x10

    if-lt v0, v1, :cond_0

    invoke-virtual {p0}, Landroid/app/Activity;->finishAffinity()V

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Landroid/app/Activity;->finish()V

    :goto_0
    return-void
.end method
