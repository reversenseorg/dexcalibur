.class public abstract Landroid/view/ViewOutlineProvider;
.super Ljava/lang/Object;
.source "ViewOutlineProvider.java"


# static fields
.field public static final BACKGROUND:Landroid/view/ViewOutlineProvider;

.field public static final BOUNDS:Landroid/view/ViewOutlineProvider;

.field public static final PADDED_BOUNDS:Landroid/view/ViewOutlineProvider;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 9
    sput-object v0, Landroid/view/ViewOutlineProvider;->BACKGROUND:Landroid/view/ViewOutlineProvider;

    sput-object v0, Landroid/view/ViewOutlineProvider;->BOUNDS:Landroid/view/ViewOutlineProvider;

    sput-object v0, Landroid/view/ViewOutlineProvider;->PADDED_BOUNDS:Landroid/view/ViewOutlineProvider;

    return-void
.end method

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
.method public abstract getOutline(Landroid/view/View;Landroid/graphics/Outline;)V
.end method
