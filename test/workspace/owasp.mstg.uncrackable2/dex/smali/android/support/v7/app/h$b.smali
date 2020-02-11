.class final Landroid/support/v7/app/h$b;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v7/app/h;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x10
    name = "b"
.end annotation


# instance fields
.field final synthetic a:Landroid/support/v7/app/h;

.field private b:Landroid/support/v7/app/o;

.field private c:Z

.field private d:Landroid/content/BroadcastReceiver;

.field private e:Landroid/content/IntentFilter;


# direct methods
.method constructor <init>(Landroid/support/v7/app/h;Landroid/support/v7/app/o;)V
    .locals 0

    iput-object p1, p0, Landroid/support/v7/app/h$b;->a:Landroid/support/v7/app/h;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p2, p0, Landroid/support/v7/app/h$b;->b:Landroid/support/v7/app/o;

    invoke-virtual {p2}, Landroid/support/v7/app/o;->a()Z

    move-result p1

    iput-boolean p1, p0, Landroid/support/v7/app/h$b;->c:Z

    return-void
.end method


# virtual methods
.method final a()I
    .locals 1

    iget-object v0, p0, Landroid/support/v7/app/h$b;->b:Landroid/support/v7/app/o;

    invoke-virtual {v0}, Landroid/support/v7/app/o;->a()Z

    move-result v0

    iput-boolean v0, p0, Landroid/support/v7/app/h$b;->c:Z

    iget-boolean v0, p0, Landroid/support/v7/app/h$b;->c:Z

    if-eqz v0, :cond_0

    const/4 v0, 0x2

    goto :goto_0

    :cond_0
    const/4 v0, 0x1

    :goto_0
    return v0
.end method

.method final b()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/app/h$b;->b:Landroid/support/v7/app/o;

    invoke-virtual {v0}, Landroid/support/v7/app/o;->a()Z

    move-result v0

    iget-boolean v1, p0, Landroid/support/v7/app/h$b;->c:Z

    if-eq v0, v1, :cond_0

    iput-boolean v0, p0, Landroid/support/v7/app/h$b;->c:Z

    iget-object v0, p0, Landroid/support/v7/app/h$b;->a:Landroid/support/v7/app/h;

    invoke-virtual {v0}, Landroid/support/v7/app/h;->i()Z

    :cond_0
    return-void
.end method

.method final c()V
    .locals 3

    invoke-virtual {p0}, Landroid/support/v7/app/h$b;->d()V

    iget-object v0, p0, Landroid/support/v7/app/h$b;->d:Landroid/content/BroadcastReceiver;

    if-nez v0, :cond_0

    new-instance v0, Landroid/support/v7/app/h$b$1;

    invoke-direct {v0, p0}, Landroid/support/v7/app/h$b$1;-><init>(Landroid/support/v7/app/h$b;)V

    iput-object v0, p0, Landroid/support/v7/app/h$b;->d:Landroid/content/BroadcastReceiver;

    :cond_0
    iget-object v0, p0, Landroid/support/v7/app/h$b;->e:Landroid/content/IntentFilter;

    if-nez v0, :cond_1

    new-instance v0, Landroid/content/IntentFilter;

    invoke-direct {v0}, Landroid/content/IntentFilter;-><init>()V

    iput-object v0, p0, Landroid/support/v7/app/h$b;->e:Landroid/content/IntentFilter;

    iget-object v0, p0, Landroid/support/v7/app/h$b;->e:Landroid/content/IntentFilter;

    const-string v1, "android.intent.action.TIME_SET"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    iget-object v0, p0, Landroid/support/v7/app/h$b;->e:Landroid/content/IntentFilter;

    const-string v1, "android.intent.action.TIMEZONE_CHANGED"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    iget-object v0, p0, Landroid/support/v7/app/h$b;->e:Landroid/content/IntentFilter;

    const-string v1, "android.intent.action.TIME_TICK"

    invoke-virtual {v0, v1}, Landroid/content/IntentFilter;->addAction(Ljava/lang/String;)V

    :cond_1
    iget-object v0, p0, Landroid/support/v7/app/h$b;->a:Landroid/support/v7/app/h;

    iget-object v0, v0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    iget-object v1, p0, Landroid/support/v7/app/h$b;->d:Landroid/content/BroadcastReceiver;

    iget-object v2, p0, Landroid/support/v7/app/h$b;->e:Landroid/content/IntentFilter;

    invoke-virtual {v0, v1, v2}, Landroid/content/Context;->registerReceiver(Landroid/content/BroadcastReceiver;Landroid/content/IntentFilter;)Landroid/content/Intent;

    return-void
.end method

.method final d()V
    .locals 2

    iget-object v0, p0, Landroid/support/v7/app/h$b;->d:Landroid/content/BroadcastReceiver;

    if-eqz v0, :cond_0

    iget-object v0, p0, Landroid/support/v7/app/h$b;->a:Landroid/support/v7/app/h;

    iget-object v0, v0, Landroid/support/v7/app/h;->a:Landroid/content/Context;

    iget-object v1, p0, Landroid/support/v7/app/h$b;->d:Landroid/content/BroadcastReceiver;

    invoke-virtual {v0, v1}, Landroid/content/Context;->unregisterReceiver(Landroid/content/BroadcastReceiver;)V

    const/4 v0, 0x0

    iput-object v0, p0, Landroid/support/v7/app/h$b;->d:Landroid/content/BroadcastReceiver;

    :cond_0
    return-void
.end method
