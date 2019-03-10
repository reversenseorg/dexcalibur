.class public final enum Ljava/text/Normalizer$Form;
.super Ljava/lang/Enum;
.source "Normalizer.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/text/Normalizer;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Form"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/text/Normalizer$Form;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/text/Normalizer$Form;

.field public static final enum NFC:Ljava/text/Normalizer$Form;

.field public static final enum NFD:Ljava/text/Normalizer$Form;

.field public static final enum NFKC:Ljava/text/Normalizer$Form;

.field public static final enum NFKD:Ljava/text/Normalizer$Form;


# direct methods
.method static constructor <clinit>()V
    .locals 6

    .prologue
    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Ljava/text/Normalizer$Form;

    const-string v1, "NFC"

    invoke-direct {v0, v1, v2}, Ljava/text/Normalizer$Form;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/text/Normalizer$Form;->NFC:Ljava/text/Normalizer$Form;

    .line 7
    new-instance v0, Ljava/text/Normalizer$Form;

    const-string v1, "NFD"

    invoke-direct {v0, v1, v3}, Ljava/text/Normalizer$Form;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/text/Normalizer$Form;->NFD:Ljava/text/Normalizer$Form;

    .line 8
    new-instance v0, Ljava/text/Normalizer$Form;

    const-string v1, "NFKC"

    invoke-direct {v0, v1, v4}, Ljava/text/Normalizer$Form;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/text/Normalizer$Form;->NFKC:Ljava/text/Normalizer$Form;

    .line 9
    new-instance v0, Ljava/text/Normalizer$Form;

    const-string v1, "NFKD"

    invoke-direct {v0, v1, v5}, Ljava/text/Normalizer$Form;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/text/Normalizer$Form;->NFKD:Ljava/text/Normalizer$Form;

    .line 4
    const/4 v0, 0x4

    new-array v0, v0, [Ljava/text/Normalizer$Form;

    sget-object v1, Ljava/text/Normalizer$Form;->NFC:Ljava/text/Normalizer$Form;

    aput-object v1, v0, v2

    sget-object v1, Ljava/text/Normalizer$Form;->NFD:Ljava/text/Normalizer$Form;

    aput-object v1, v0, v3

    sget-object v1, Ljava/text/Normalizer$Form;->NFKC:Ljava/text/Normalizer$Form;

    aput-object v1, v0, v4

    sget-object v1, Ljava/text/Normalizer$Form;->NFKD:Ljava/text/Normalizer$Form;

    aput-object v1, v0, v5

    sput-object v0, Ljava/text/Normalizer$Form;->$VALUES:[Ljava/text/Normalizer$Form;

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
    .line 4
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Ljava/text/Normalizer$Form;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Ljava/text/Normalizer$Form;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/text/Normalizer$Form;

    return-object v0
.end method

.method public static values()[Ljava/text/Normalizer$Form;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Ljava/text/Normalizer$Form;->$VALUES:[Ljava/text/Normalizer$Form;

    invoke-virtual {v0}, [Ljava/text/Normalizer$Form;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/text/Normalizer$Form;

    return-object v0
.end method
