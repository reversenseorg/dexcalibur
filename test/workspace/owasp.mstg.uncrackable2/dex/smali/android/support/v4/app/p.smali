.class final Landroid/support/v4/app/p;
.super Ljava/lang/Object;

# interfaces
.implements Landroid/os/Parcelable;


# static fields
.field public static final CREATOR:Landroid/os/Parcelable$Creator;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroid/os/Parcelable$Creator<",
            "Landroid/support/v4/app/p;",
            ">;"
        }
    .end annotation
.end field


# instance fields
.field final a:Ljava/lang/String;

.field final b:I

.field final c:Z

.field final d:I

.field final e:I

.field final f:Ljava/lang/String;

.field final g:Z

.field final h:Z

.field final i:Landroid/os/Bundle;

.field final j:Z

.field k:Landroid/os/Bundle;

.field l:Landroid/support/v4/app/g;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    new-instance v0, Landroid/support/v4/app/p$1;

    invoke-direct {v0}, Landroid/support/v4/app/p$1;-><init>()V

    sput-object v0, Landroid/support/v4/app/p;->CREATOR:Landroid/os/Parcelable$Creator;

    return-void
.end method

.method constructor <init>(Landroid/os/Parcel;)V
    .locals 3

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    invoke-virtual {p1}, Landroid/os/Parcel;->readString()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Landroid/support/v4/app/p;->a:Ljava/lang/String;

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    iput v0, p0, Landroid/support/v4/app/p;->b:I

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    const/4 v1, 0x0

    const/4 v2, 0x1

    if-eqz v0, :cond_0

    const/4 v0, 0x1

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    iput-boolean v0, p0, Landroid/support/v4/app/p;->c:Z

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    iput v0, p0, Landroid/support/v4/app/p;->d:I

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    iput v0, p0, Landroid/support/v4/app/p;->e:I

    invoke-virtual {p1}, Landroid/os/Parcel;->readString()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Landroid/support/v4/app/p;->f:Ljava/lang/String;

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x1

    goto :goto_1

    :cond_1
    const/4 v0, 0x0

    :goto_1
    iput-boolean v0, p0, Landroid/support/v4/app/p;->g:Z

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    if-eqz v0, :cond_2

    const/4 v0, 0x1

    goto :goto_2

    :cond_2
    const/4 v0, 0x0

    :goto_2
    iput-boolean v0, p0, Landroid/support/v4/app/p;->h:Z

    invoke-virtual {p1}, Landroid/os/Parcel;->readBundle()Landroid/os/Bundle;

    move-result-object v0

    iput-object v0, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    invoke-virtual {p1}, Landroid/os/Parcel;->readInt()I

    move-result v0

    if-eqz v0, :cond_3

    const/4 v1, 0x1

    :cond_3
    iput-boolean v1, p0, Landroid/support/v4/app/p;->j:Z

    invoke-virtual {p1}, Landroid/os/Parcel;->readBundle()Landroid/os/Bundle;

    move-result-object p1

    iput-object p1, p0, Landroid/support/v4/app/p;->k:Landroid/os/Bundle;

    return-void
.end method

.method constructor <init>(Landroid/support/v4/app/g;)V
    .locals 1

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    invoke-virtual {p1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Landroid/support/v4/app/p;->a:Ljava/lang/String;

    iget v0, p1, Landroid/support/v4/app/g;->f:I

    iput v0, p0, Landroid/support/v4/app/p;->b:I

    iget-boolean v0, p1, Landroid/support/v4/app/g;->n:Z

    iput-boolean v0, p0, Landroid/support/v4/app/p;->c:Z

    iget v0, p1, Landroid/support/v4/app/g;->y:I

    iput v0, p0, Landroid/support/v4/app/p;->d:I

    iget v0, p1, Landroid/support/v4/app/g;->z:I

    iput v0, p0, Landroid/support/v4/app/p;->e:I

    iget-object v0, p1, Landroid/support/v4/app/g;->A:Ljava/lang/String;

    iput-object v0, p0, Landroid/support/v4/app/p;->f:Ljava/lang/String;

    iget-boolean v0, p1, Landroid/support/v4/app/g;->D:Z

    iput-boolean v0, p0, Landroid/support/v4/app/p;->g:Z

    iget-boolean v0, p1, Landroid/support/v4/app/g;->C:Z

    iput-boolean v0, p0, Landroid/support/v4/app/p;->h:Z

    iget-object v0, p1, Landroid/support/v4/app/g;->h:Landroid/os/Bundle;

    iput-object v0, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    iget-boolean p1, p1, Landroid/support/v4/app/g;->B:Z

    iput-boolean p1, p0, Landroid/support/v4/app/p;->j:Z

    return-void
.end method


# virtual methods
.method public a(Landroid/support/v4/app/k;Landroid/support/v4/app/i;Landroid/support/v4/app/g;Landroid/support/v4/app/n;Landroid/arch/lifecycle/p;)Landroid/support/v4/app/g;
    .locals 3

    iget-object v0, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    if-nez v0, :cond_3

    invoke-virtual {p1}, Landroid/support/v4/app/k;->g()Landroid/content/Context;

    move-result-object v0

    iget-object v1, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    if-eqz v1, :cond_0

    iget-object v1, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    invoke-virtual {v0}, Landroid/content/Context;->getClassLoader()Ljava/lang/ClassLoader;

    move-result-object v2

    invoke-virtual {v1, v2}, Landroid/os/Bundle;->setClassLoader(Ljava/lang/ClassLoader;)V

    :cond_0
    if-eqz p2, :cond_1

    iget-object v1, p0, Landroid/support/v4/app/p;->a:Ljava/lang/String;

    iget-object v2, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    invoke-virtual {p2, v0, v1, v2}, Landroid/support/v4/app/i;->a(Landroid/content/Context;Ljava/lang/String;Landroid/os/Bundle;)Landroid/support/v4/app/g;

    move-result-object p2

    :goto_0
    iput-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    goto :goto_1

    :cond_1
    iget-object p2, p0, Landroid/support/v4/app/p;->a:Ljava/lang/String;

    iget-object v1, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    invoke-static {v0, p2, v1}, Landroid/support/v4/app/g;->a(Landroid/content/Context;Ljava/lang/String;Landroid/os/Bundle;)Landroid/support/v4/app/g;

    move-result-object p2

    goto :goto_0

    :goto_1
    iget-object p2, p0, Landroid/support/v4/app/p;->k:Landroid/os/Bundle;

    if-eqz p2, :cond_2

    iget-object p2, p0, Landroid/support/v4/app/p;->k:Landroid/os/Bundle;

    invoke-virtual {v0}, Landroid/content/Context;->getClassLoader()Ljava/lang/ClassLoader;

    move-result-object v0

    invoke-virtual {p2, v0}, Landroid/os/Bundle;->setClassLoader(Ljava/lang/ClassLoader;)V

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-object v0, p0, Landroid/support/v4/app/p;->k:Landroid/os/Bundle;

    iput-object v0, p2, Landroid/support/v4/app/g;->c:Landroid/os/Bundle;

    :cond_2
    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget v0, p0, Landroid/support/v4/app/p;->b:I

    invoke-virtual {p2, v0, p3}, Landroid/support/v4/app/g;->a(ILandroid/support/v4/app/g;)V

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-boolean p3, p0, Landroid/support/v4/app/p;->c:Z

    iput-boolean p3, p2, Landroid/support/v4/app/g;->n:Z

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    const/4 p3, 0x1

    iput-boolean p3, p2, Landroid/support/v4/app/g;->p:Z

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget p3, p0, Landroid/support/v4/app/p;->d:I

    iput p3, p2, Landroid/support/v4/app/g;->y:I

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget p3, p0, Landroid/support/v4/app/p;->e:I

    iput p3, p2, Landroid/support/v4/app/g;->z:I

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-object p3, p0, Landroid/support/v4/app/p;->f:Ljava/lang/String;

    iput-object p3, p2, Landroid/support/v4/app/g;->A:Ljava/lang/String;

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-boolean p3, p0, Landroid/support/v4/app/p;->g:Z

    iput-boolean p3, p2, Landroid/support/v4/app/g;->D:Z

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-boolean p3, p0, Landroid/support/v4/app/p;->h:Z

    iput-boolean p3, p2, Landroid/support/v4/app/g;->C:Z

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-boolean p3, p0, Landroid/support/v4/app/p;->j:Z

    iput-boolean p3, p2, Landroid/support/v4/app/g;->B:Z

    iget-object p2, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iget-object p1, p1, Landroid/support/v4/app/k;->d:Landroid/support/v4/app/m;

    iput-object p1, p2, Landroid/support/v4/app/g;->s:Landroid/support/v4/app/m;

    sget-boolean p1, Landroid/support/v4/app/m;->a:Z

    if-eqz p1, :cond_3

    const-string p1, "FragmentManager"

    new-instance p2, Ljava/lang/StringBuilder;

    invoke-direct {p2}, Ljava/lang/StringBuilder;-><init>()V

    const-string p3, "Instantiated fragment "

    invoke-virtual {p2, p3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    iget-object p3, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    invoke-virtual {p2, p3}, Ljava/lang/StringBuilder;->append(Ljava/lang/Object;)Ljava/lang/StringBuilder;

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    invoke-static {p1, p2}, Landroid/util/Log;->v(Ljava/lang/String;Ljava/lang/String;)I

    :cond_3
    iget-object p1, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iput-object p4, p1, Landroid/support/v4/app/g;->v:Landroid/support/v4/app/n;

    iget-object p1, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    iput-object p5, p1, Landroid/support/v4/app/g;->w:Landroid/arch/lifecycle/p;

    iget-object p1, p0, Landroid/support/v4/app/p;->l:Landroid/support/v4/app/g;

    return-object p1
.end method

.method public describeContents()I
    .locals 1

    const/4 v0, 0x0

    return v0
.end method

.method public writeToParcel(Landroid/os/Parcel;I)V
    .locals 0

    iget-object p2, p0, Landroid/support/v4/app/p;->a:Ljava/lang/String;

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeString(Ljava/lang/String;)V

    iget p2, p0, Landroid/support/v4/app/p;->b:I

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget-boolean p2, p0, Landroid/support/v4/app/p;->c:Z

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget p2, p0, Landroid/support/v4/app/p;->d:I

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget p2, p0, Landroid/support/v4/app/p;->e:I

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget-object p2, p0, Landroid/support/v4/app/p;->f:Ljava/lang/String;

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeString(Ljava/lang/String;)V

    iget-boolean p2, p0, Landroid/support/v4/app/p;->g:Z

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget-boolean p2, p0, Landroid/support/v4/app/p;->h:Z

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget-object p2, p0, Landroid/support/v4/app/p;->i:Landroid/os/Bundle;

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeBundle(Landroid/os/Bundle;)V

    iget-boolean p2, p0, Landroid/support/v4/app/p;->j:Z

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeInt(I)V

    iget-object p2, p0, Landroid/support/v4/app/p;->k:Landroid/os/Bundle;

    invoke-virtual {p1, p2}, Landroid/os/Parcel;->writeBundle(Landroid/os/Bundle;)V

    return-void
.end method
