.class public final enum Landroid/webkit/WebSettings$RenderPriority;
.super Ljava/lang/Enum;
.source "WebSettings.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/webkit/WebSettings;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "RenderPriority"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/webkit/WebSettings$RenderPriority;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/webkit/WebSettings$RenderPriority;

.field public static final enum HIGH:Landroid/webkit/WebSettings$RenderPriority;

.field public static final enum LOW:Landroid/webkit/WebSettings$RenderPriority;

.field public static final enum NORMAL:Landroid/webkit/WebSettings$RenderPriority;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 28
    new-instance v0, Landroid/webkit/WebSettings$RenderPriority;

    const-string v1, "HIGH"

    invoke-direct {v0, v1, v2}, Landroid/webkit/WebSettings$RenderPriority;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/WebSettings$RenderPriority;->HIGH:Landroid/webkit/WebSettings$RenderPriority;

    .line 29
    new-instance v0, Landroid/webkit/WebSettings$RenderPriority;

    const-string v1, "LOW"

    invoke-direct {v0, v1, v3}, Landroid/webkit/WebSettings$RenderPriority;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/WebSettings$RenderPriority;->LOW:Landroid/webkit/WebSettings$RenderPriority;

    .line 30
    new-instance v0, Landroid/webkit/WebSettings$RenderPriority;

    const-string v1, "NORMAL"

    invoke-direct {v0, v1, v4}, Landroid/webkit/WebSettings$RenderPriority;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/webkit/WebSettings$RenderPriority;->NORMAL:Landroid/webkit/WebSettings$RenderPriority;

    .line 26
    const/4 v0, 0x3

    new-array v0, v0, [Landroid/webkit/WebSettings$RenderPriority;

    sget-object v1, Landroid/webkit/WebSettings$RenderPriority;->HIGH:Landroid/webkit/WebSettings$RenderPriority;

    aput-object v1, v0, v2

    sget-object v1, Landroid/webkit/WebSettings$RenderPriority;->LOW:Landroid/webkit/WebSettings$RenderPriority;

    aput-object v1, v0, v3

    sget-object v1, Landroid/webkit/WebSettings$RenderPriority;->NORMAL:Landroid/webkit/WebSettings$RenderPriority;

    aput-object v1, v0, v4

    sput-object v0, Landroid/webkit/WebSettings$RenderPriority;->$VALUES:[Landroid/webkit/WebSettings$RenderPriority;

    return-void
.end method

.method private constructor <init>(Ljava/lang/String;I)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()V"
        }
    .end annotation

    .prologue
    .line 26
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/webkit/WebSettings$RenderPriority;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 26
    const-class v0, Landroid/webkit/WebSettings$RenderPriority;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/webkit/WebSettings$RenderPriority;

    return-object v0
.end method

.method public static values()[Landroid/webkit/WebSettings$RenderPriority;
    .locals 1

    .prologue
    .line 26
    sget-object v0, Landroid/webkit/WebSettings$RenderPriority;->$VALUES:[Landroid/webkit/WebSettings$RenderPriority;

    invoke-virtual {v0}, [Landroid/webkit/WebSettings$RenderPriority;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/webkit/WebSettings$RenderPriority;

    return-object v0
.end method
