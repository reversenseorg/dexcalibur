.class Landroid/support/b/a/c$1;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/graphics/drawable/Drawable$Callback;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/b/a/c;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Landroid/support/b/a/c;


# direct methods
.method constructor <init>(Landroid/support/b/a/c;)V
    .locals 0

    iput-object p1, p0, Landroid/support/b/a/c$1;->a:Landroid/support/b/a/c;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public invalidateDrawable(Landroid/graphics/drawable/Drawable;)V
    .locals 0

    iget-object p1, p0, Landroid/support/b/a/c$1;->a:Landroid/support/b/a/c;

    invoke-virtual {p1}, Landroid/support/b/a/c;->invalidateSelf()V

    return-void
.end method

.method public scheduleDrawable(Landroid/graphics/drawable/Drawable;Ljava/lang/Runnable;J)V
    .locals 0

    iget-object p1, p0, Landroid/support/b/a/c$1;->a:Landroid/support/b/a/c;

    invoke-virtual {p1, p2, p3, p4}, Landroid/support/b/a/c;->scheduleSelf(Ljava/lang/Runnable;J)V

    return-void
.end method

.method public unscheduleDrawable(Landroid/graphics/drawable/Drawable;Ljava/lang/Runnable;)V
    .locals 0

    iget-object p1, p0, Landroid/support/b/a/c$1;->a:Landroid/support/b/a/c;

    invoke-virtual {p1, p2}, Landroid/support/b/a/c;->unscheduleSelf(Ljava/lang/Runnable;)V

    return-void
.end method
