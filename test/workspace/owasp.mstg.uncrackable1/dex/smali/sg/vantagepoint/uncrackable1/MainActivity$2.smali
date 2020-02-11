.class Lsg/vantagepoint/uncrackable1/MainActivity$2;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/content/DialogInterface$OnClickListener;


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lsg/vantagepoint/uncrackable1/MainActivity;->verify(Landroid/view/View;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic a:Lsg/vantagepoint/uncrackable1/MainActivity;


# direct methods
.method constructor <init>(Lsg/vantagepoint/uncrackable1/MainActivity;)V
    .locals 0

    iput-object p1, p0, Lsg/vantagepoint/uncrackable1/MainActivity$2;->a:Lsg/vantagepoint/uncrackable1/MainActivity;

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public onClick(Landroid/content/DialogInterface;I)V
    .locals 0

    invoke-interface {p1}, Landroid/content/DialogInterface;->dismiss()V

    return-void
.end method
