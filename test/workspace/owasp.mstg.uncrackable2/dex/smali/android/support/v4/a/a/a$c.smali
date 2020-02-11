.class public final Landroid/support/v4/a/a/a$c;
.super Ljava/lang/Object;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/support/v4/a/a/a;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x19
    name = "c"
.end annotation


# instance fields
.field private final a:Ljava/lang/String;

.field private b:I

.field private c:Z

.field private d:I


# direct methods
.method public constructor <init>(Ljava/lang/String;IZI)V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p1, p0, Landroid/support/v4/a/a/a$c;->a:Ljava/lang/String;

    iput p2, p0, Landroid/support/v4/a/a/a$c;->b:I

    iput-boolean p3, p0, Landroid/support/v4/a/a/a$c;->c:Z

    iput p4, p0, Landroid/support/v4/a/a/a$c;->d:I

    return-void
.end method


# virtual methods
.method public a()Ljava/lang/String;
    .locals 1

    iget-object v0, p0, Landroid/support/v4/a/a/a$c;->a:Ljava/lang/String;

    return-object v0
.end method

.method public b()I
    .locals 1

    iget v0, p0, Landroid/support/v4/a/a/a$c;->b:I

    return v0
.end method

.method public c()Z
    .locals 1

    iget-boolean v0, p0, Landroid/support/v4/a/a/a$c;->c:Z

    return v0
.end method

.method public d()I
    .locals 1

    iget v0, p0, Landroid/support/v4/a/a/a$c;->d:I

    return v0
.end method
