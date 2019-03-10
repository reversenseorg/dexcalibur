.class public abstract Landroid/app/ActionBar$Tab;
.super Ljava/lang/Object;
.source "ActionBar.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/app/ActionBar;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x409
    name = "Tab"
.end annotation

.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final INVALID_POSITION:I = -0x1


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 16
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract getContentDescription()Ljava/lang/CharSequence;
.end method

.method public abstract getCustomView()Landroid/view/View;
.end method

.method public abstract getIcon()Landroid/graphics/drawable/Drawable;
.end method

.method public abstract getPosition()I
.end method

.method public abstract getTag()Ljava/lang/Object;
.end method

.method public abstract getText()Ljava/lang/CharSequence;
.end method

.method public abstract select()V
.end method

.method public abstract setContentDescription(I)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setContentDescription(Ljava/lang/CharSequence;)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setCustomView(I)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setCustomView(Landroid/view/View;)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setIcon(I)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setIcon(Landroid/graphics/drawable/Drawable;)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setTabListener(Landroid/app/ActionBar$TabListener;)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setTag(Ljava/lang/Object;)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setText(I)Landroid/app/ActionBar$Tab;
.end method

.method public abstract setText(Ljava/lang/CharSequence;)Landroid/app/ActionBar$Tab;
.end method
