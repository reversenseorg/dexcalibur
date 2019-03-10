.class public abstract Landroid/app/FragmentTransaction;
.super Ljava/lang/Object;
.source "FragmentTransaction.java"


# static fields
.field public static final TRANSIT_ENTER_MASK:I = 0x1000

.field public static final TRANSIT_EXIT_MASK:I = 0x2000

.field public static final TRANSIT_FRAGMENT_CLOSE:I = 0x2002

.field public static final TRANSIT_FRAGMENT_FADE:I = 0x1003

.field public static final TRANSIT_FRAGMENT_OPEN:I = 0x1001

.field public static final TRANSIT_NONE:I = 0x0

.field public static final TRANSIT_UNSET:I = -0x1


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract add(ILandroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method

.method public abstract add(ILandroid/app/Fragment;Ljava/lang/String;)Landroid/app/FragmentTransaction;
.end method

.method public abstract add(Landroid/app/Fragment;Ljava/lang/String;)Landroid/app/FragmentTransaction;
.end method

.method public abstract addSharedElement(Landroid/view/View;Ljava/lang/String;)Landroid/app/FragmentTransaction;
.end method

.method public abstract addToBackStack(Ljava/lang/String;)Landroid/app/FragmentTransaction;
.end method

.method public abstract attach(Landroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method

.method public abstract commit()I
.end method

.method public abstract commitAllowingStateLoss()I
.end method

.method public abstract detach(Landroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method

.method public abstract disallowAddToBackStack()Landroid/app/FragmentTransaction;
.end method

.method public abstract hide(Landroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method

.method public abstract isAddToBackStackAllowed()Z
.end method

.method public abstract isEmpty()Z
.end method

.method public abstract remove(Landroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method

.method public abstract replace(ILandroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method

.method public abstract replace(ILandroid/app/Fragment;Ljava/lang/String;)Landroid/app/FragmentTransaction;
.end method

.method public abstract setBreadCrumbShortTitle(I)Landroid/app/FragmentTransaction;
.end method

.method public abstract setBreadCrumbShortTitle(Ljava/lang/CharSequence;)Landroid/app/FragmentTransaction;
.end method

.method public abstract setBreadCrumbTitle(I)Landroid/app/FragmentTransaction;
.end method

.method public abstract setBreadCrumbTitle(Ljava/lang/CharSequence;)Landroid/app/FragmentTransaction;
.end method

.method public abstract setCustomAnimations(II)Landroid/app/FragmentTransaction;
.end method

.method public abstract setCustomAnimations(IIII)Landroid/app/FragmentTransaction;
.end method

.method public abstract setTransition(I)Landroid/app/FragmentTransaction;
.end method

.method public abstract setTransitionStyle(I)Landroid/app/FragmentTransaction;
.end method

.method public abstract show(Landroid/app/Fragment;)Landroid/app/FragmentTransaction;
.end method
