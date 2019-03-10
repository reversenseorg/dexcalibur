.class public final enum Ljava/util/Formatter$BigDecimalLayoutForm;
.super Ljava/lang/Enum;
.source "Formatter.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/util/Formatter;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "BigDecimalLayoutForm"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/util/Formatter$BigDecimalLayoutForm;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/util/Formatter$BigDecimalLayoutForm;

.field public static final enum DECIMAL_FLOAT:Ljava/util/Formatter$BigDecimalLayoutForm;

.field public static final enum SCIENTIFIC:Ljava/util/Formatter$BigDecimalLayoutForm;


# direct methods
.method static constructor <clinit>()V
    .locals 4

    .prologue
    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 7
    new-instance v0, Ljava/util/Formatter$BigDecimalLayoutForm;

    const-string v1, "DECIMAL_FLOAT"

    invoke-direct {v0, v1, v2}, Ljava/util/Formatter$BigDecimalLayoutForm;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/Formatter$BigDecimalLayoutForm;->DECIMAL_FLOAT:Ljava/util/Formatter$BigDecimalLayoutForm;

    .line 8
    new-instance v0, Ljava/util/Formatter$BigDecimalLayoutForm;

    const-string v1, "SCIENTIFIC"

    invoke-direct {v0, v1, v3}, Ljava/util/Formatter$BigDecimalLayoutForm;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/Formatter$BigDecimalLayoutForm;->SCIENTIFIC:Ljava/util/Formatter$BigDecimalLayoutForm;

    .line 5
    const/4 v0, 0x2

    new-array v0, v0, [Ljava/util/Formatter$BigDecimalLayoutForm;

    sget-object v1, Ljava/util/Formatter$BigDecimalLayoutForm;->DECIMAL_FLOAT:Ljava/util/Formatter$BigDecimalLayoutForm;

    aput-object v1, v0, v2

    sget-object v1, Ljava/util/Formatter$BigDecimalLayoutForm;->SCIENTIFIC:Ljava/util/Formatter$BigDecimalLayoutForm;

    aput-object v1, v0, v3

    sput-object v0, Ljava/util/Formatter$BigDecimalLayoutForm;->$VALUES:[Ljava/util/Formatter$BigDecimalLayoutForm;

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
    .line 5
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Ljava/util/Formatter$BigDecimalLayoutForm;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Ljava/util/Formatter$BigDecimalLayoutForm;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/util/Formatter$BigDecimalLayoutForm;

    return-object v0
.end method

.method public static values()[Ljava/util/Formatter$BigDecimalLayoutForm;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Ljava/util/Formatter$BigDecimalLayoutForm;->$VALUES:[Ljava/util/Formatter$BigDecimalLayoutForm;

    invoke-virtual {v0}, [Ljava/util/Formatter$BigDecimalLayoutForm;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/util/Formatter$BigDecimalLayoutForm;

    return-object v0
.end method
