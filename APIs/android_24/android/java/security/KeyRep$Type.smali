.class public final enum Ljava/security/KeyRep$Type;
.super Ljava/lang/Enum;
.source "KeyRep.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/security/KeyRep;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "Type"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/security/KeyRep$Type;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/security/KeyRep$Type;

.field public static final enum PRIVATE:Ljava/security/KeyRep$Type;

.field public static final enum PUBLIC:Ljava/security/KeyRep$Type;

.field public static final enum SECRET:Ljava/security/KeyRep$Type;


# direct methods
.method static constructor <clinit>()V
    .locals 5

    .prologue
    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 7
    new-instance v0, Ljava/security/KeyRep$Type;

    const-string v1, "PRIVATE"

    invoke-direct {v0, v1, v2}, Ljava/security/KeyRep$Type;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/security/KeyRep$Type;->PRIVATE:Ljava/security/KeyRep$Type;

    .line 8
    new-instance v0, Ljava/security/KeyRep$Type;

    const-string v1, "PUBLIC"

    invoke-direct {v0, v1, v3}, Ljava/security/KeyRep$Type;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/security/KeyRep$Type;->PUBLIC:Ljava/security/KeyRep$Type;

    .line 9
    new-instance v0, Ljava/security/KeyRep$Type;

    const-string v1, "SECRET"

    invoke-direct {v0, v1, v4}, Ljava/security/KeyRep$Type;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/security/KeyRep$Type;->SECRET:Ljava/security/KeyRep$Type;

    .line 5
    const/4 v0, 0x3

    new-array v0, v0, [Ljava/security/KeyRep$Type;

    sget-object v1, Ljava/security/KeyRep$Type;->PRIVATE:Ljava/security/KeyRep$Type;

    aput-object v1, v0, v2

    sget-object v1, Ljava/security/KeyRep$Type;->PUBLIC:Ljava/security/KeyRep$Type;

    aput-object v1, v0, v3

    sget-object v1, Ljava/security/KeyRep$Type;->SECRET:Ljava/security/KeyRep$Type;

    aput-object v1, v0, v4

    sput-object v0, Ljava/security/KeyRep$Type;->$VALUES:[Ljava/security/KeyRep$Type;

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

.method public static valueOf(Ljava/lang/String;)Ljava/security/KeyRep$Type;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Ljava/security/KeyRep$Type;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/security/KeyRep$Type;

    return-object v0
.end method

.method public static values()[Ljava/security/KeyRep$Type;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Ljava/security/KeyRep$Type;->$VALUES:[Ljava/security/KeyRep$Type;

    invoke-virtual {v0}, [Ljava/security/KeyRep$Type;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/security/KeyRep$Type;

    return-object v0
.end method
