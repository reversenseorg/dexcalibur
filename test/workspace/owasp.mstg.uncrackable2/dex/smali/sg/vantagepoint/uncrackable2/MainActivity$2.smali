.class Lsg/vantagepoint/uncrackable2/MainActivity$2;
.super Landroid/os/AsyncTask;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lsg/vantagepoint/uncrackable2/MainActivity;->onCreate(Landroid/os/Bundle;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Landroid/os/AsyncTask<",
        "Ljava/lang/Void;",
        "Ljava/lang/String;",
        "Ljava/lang/String;",
        ">;"
    }
.end annotation


# instance fields
.field final synthetic a:Lsg/vantagepoint/uncrackable2/MainActivity;


# direct methods
.method constructor <init>(Lsg/vantagepoint/uncrackable2/MainActivity;)V
    .locals 0

    iput-object p1, p0, Lsg/vantagepoint/uncrackable2/MainActivity$2;->a:Lsg/vantagepoint/uncrackable2/MainActivity;

    invoke-direct {p0}, Landroid/os/AsyncTask;-><init>()V

    return-void
.end method


# virtual methods
.method protected varargs a([Ljava/lang/Void;)Ljava/lang/String;
    .locals 2

    :goto_0
    invoke-static {}, Landroid/os/Debug;->isDebuggerConnected()Z

    move-result p1

    if-nez p1, :cond_0

    const-wide/16 v0, 0x64

    invoke-static {v0, v1}, Landroid/os/SystemClock;->sleep(J)V

    goto :goto_0

    :cond_0
    const/4 p1, 0x0

    return-object p1
.end method

.method protected a(Ljava/lang/String;)V
    .locals 1

    iget-object p1, p0, Lsg/vantagepoint/uncrackable2/MainActivity$2;->a:Lsg/vantagepoint/uncrackable2/MainActivity;

    const-string v0, "Debugger detected!"

    invoke-static {p1, v0}, Lsg/vantagepoint/uncrackable2/MainActivity;->a(Lsg/vantagepoint/uncrackable2/MainActivity;Ljava/lang/String;)V

    return-void
.end method

.method protected synthetic doInBackground([Ljava/lang/Object;)Ljava/lang/Object;
    .locals 0

    check-cast p1, [Ljava/lang/Void;

    invoke-virtual {p0, p1}, Lsg/vantagepoint/uncrackable2/MainActivity$2;->a([Ljava/lang/Void;)Ljava/lang/String;

    move-result-object p1

    return-object p1
.end method

.method protected synthetic onPostExecute(Ljava/lang/Object;)V
    .locals 0

    check-cast p1, Ljava/lang/String;

    invoke-virtual {p0, p1}, Lsg/vantagepoint/uncrackable2/MainActivity$2;->a(Ljava/lang/String;)V

    return-void
.end method
