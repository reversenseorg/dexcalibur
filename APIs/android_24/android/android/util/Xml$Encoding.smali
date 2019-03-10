.class public final enum Landroid/util/Xml$Encoding;
.super Ljava/lang/Enum;
.source "Xml.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/util/Xml;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Encoding"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/util/Xml$Encoding;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/util/Xml$Encoding;

.field public static final enum ISO_8859_1:Landroid/util/Xml$Encoding;

.field public static final enum US_ASCII:Landroid/util/Xml$Encoding;

.field public static final enum UTF_16:Landroid/util/Xml$Encoding;

.field public static final enum UTF_8:Landroid/util/Xml$Encoding;


# direct methods
.method static constructor <clinit>()V
    .locals 6

    .prologue
    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 6
    new-instance v0, Landroid/util/Xml$Encoding;

    const-string v1, "ISO_8859_1"

    invoke-direct {v0, v1, v2}, Landroid/util/Xml$Encoding;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/util/Xml$Encoding;->ISO_8859_1:Landroid/util/Xml$Encoding;

    .line 7
    new-instance v0, Landroid/util/Xml$Encoding;

    const-string v1, "US_ASCII"

    invoke-direct {v0, v1, v3}, Landroid/util/Xml$Encoding;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/util/Xml$Encoding;->US_ASCII:Landroid/util/Xml$Encoding;

    .line 8
    new-instance v0, Landroid/util/Xml$Encoding;

    const-string v1, "UTF_16"

    invoke-direct {v0, v1, v4}, Landroid/util/Xml$Encoding;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/util/Xml$Encoding;->UTF_16:Landroid/util/Xml$Encoding;

    .line 9
    new-instance v0, Landroid/util/Xml$Encoding;

    const-string v1, "UTF_8"

    invoke-direct {v0, v1, v5}, Landroid/util/Xml$Encoding;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/util/Xml$Encoding;->UTF_8:Landroid/util/Xml$Encoding;

    .line 4
    const/4 v0, 0x4

    new-array v0, v0, [Landroid/util/Xml$Encoding;

    sget-object v1, Landroid/util/Xml$Encoding;->ISO_8859_1:Landroid/util/Xml$Encoding;

    aput-object v1, v0, v2

    sget-object v1, Landroid/util/Xml$Encoding;->US_ASCII:Landroid/util/Xml$Encoding;

    aput-object v1, v0, v3

    sget-object v1, Landroid/util/Xml$Encoding;->UTF_16:Landroid/util/Xml$Encoding;

    aput-object v1, v0, v4

    sget-object v1, Landroid/util/Xml$Encoding;->UTF_8:Landroid/util/Xml$Encoding;

    aput-object v1, v0, v5

    sput-object v0, Landroid/util/Xml$Encoding;->$VALUES:[Landroid/util/Xml$Encoding;

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

.method public static valueOf(Ljava/lang/String;)Landroid/util/Xml$Encoding;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 4
    const-class v0, Landroid/util/Xml$Encoding;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/util/Xml$Encoding;

    return-object v0
.end method

.method public static values()[Landroid/util/Xml$Encoding;
    .locals 1

    .prologue
    .line 4
    sget-object v0, Landroid/util/Xml$Encoding;->$VALUES:[Landroid/util/Xml$Encoding;

    invoke-virtual {v0}, [Landroid/util/Xml$Encoding;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/util/Xml$Encoding;

    return-object v0
.end method
