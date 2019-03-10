.class public final enum Landroid/text/method/TextKeyListener$Capitalize;
.super Ljava/lang/Enum;
.source "TextKeyListener.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/text/method/TextKeyListener;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Capitalize"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/text/method/TextKeyListener$Capitalize;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/text/method/TextKeyListener$Capitalize;

.field public static final enum CHARACTERS:Landroid/text/method/TextKeyListener$Capitalize;

.field public static final enum NONE:Landroid/text/method/TextKeyListener$Capitalize;

.field public static final enum SENTENCES:Landroid/text/method/TextKeyListener$Capitalize;

.field public static final enum WORDS:Landroid/text/method/TextKeyListener$Capitalize;


# direct methods
.method static constructor <clinit>()V
    .locals 6

    .prologue
    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 8
    new-instance v0, Landroid/text/method/TextKeyListener$Capitalize;

    const-string v1, "CHARACTERS"

    invoke-direct {v0, v1, v2}, Landroid/text/method/TextKeyListener$Capitalize;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/text/method/TextKeyListener$Capitalize;->CHARACTERS:Landroid/text/method/TextKeyListener$Capitalize;

    .line 9
    new-instance v0, Landroid/text/method/TextKeyListener$Capitalize;

    const-string v1, "NONE"

    invoke-direct {v0, v1, v3}, Landroid/text/method/TextKeyListener$Capitalize;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/text/method/TextKeyListener$Capitalize;->NONE:Landroid/text/method/TextKeyListener$Capitalize;

    .line 10
    new-instance v0, Landroid/text/method/TextKeyListener$Capitalize;

    const-string v1, "SENTENCES"

    invoke-direct {v0, v1, v4}, Landroid/text/method/TextKeyListener$Capitalize;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/text/method/TextKeyListener$Capitalize;->SENTENCES:Landroid/text/method/TextKeyListener$Capitalize;

    .line 11
    new-instance v0, Landroid/text/method/TextKeyListener$Capitalize;

    const-string v1, "WORDS"

    invoke-direct {v0, v1, v5}, Landroid/text/method/TextKeyListener$Capitalize;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/text/method/TextKeyListener$Capitalize;->WORDS:Landroid/text/method/TextKeyListener$Capitalize;

    .line 6
    const/4 v0, 0x4

    new-array v0, v0, [Landroid/text/method/TextKeyListener$Capitalize;

    sget-object v1, Landroid/text/method/TextKeyListener$Capitalize;->CHARACTERS:Landroid/text/method/TextKeyListener$Capitalize;

    aput-object v1, v0, v2

    sget-object v1, Landroid/text/method/TextKeyListener$Capitalize;->NONE:Landroid/text/method/TextKeyListener$Capitalize;

    aput-object v1, v0, v3

    sget-object v1, Landroid/text/method/TextKeyListener$Capitalize;->SENTENCES:Landroid/text/method/TextKeyListener$Capitalize;

    aput-object v1, v0, v4

    sget-object v1, Landroid/text/method/TextKeyListener$Capitalize;->WORDS:Landroid/text/method/TextKeyListener$Capitalize;

    aput-object v1, v0, v5

    sput-object v0, Landroid/text/method/TextKeyListener$Capitalize;->$VALUES:[Landroid/text/method/TextKeyListener$Capitalize;

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
    .line 6
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Landroid/text/method/TextKeyListener$Capitalize;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 6
    const-class v0, Landroid/text/method/TextKeyListener$Capitalize;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/text/method/TextKeyListener$Capitalize;

    return-object v0
.end method

.method public static values()[Landroid/text/method/TextKeyListener$Capitalize;
    .locals 1

    .prologue
    .line 6
    sget-object v0, Landroid/text/method/TextKeyListener$Capitalize;->$VALUES:[Landroid/text/method/TextKeyListener$Capitalize;

    invoke-virtual {v0}, [Landroid/text/method/TextKeyListener$Capitalize;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/text/method/TextKeyListener$Capitalize;

    return-object v0
.end method
