.class public final enum Ljava/sql/RowIdLifetime;
.super Ljava/lang/Enum;
.source "RowIdLifetime.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/sql/RowIdLifetime;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/sql/RowIdLifetime;

.field public static final enum ROWID_UNSUPPORTED:Ljava/sql/RowIdLifetime;

.field public static final enum ROWID_VALID_FOREVER:Ljava/sql/RowIdLifetime;

.field public static final enum ROWID_VALID_OTHER:Ljava/sql/RowIdLifetime;

.field public static final enum ROWID_VALID_SESSION:Ljava/sql/RowIdLifetime;

.field public static final enum ROWID_VALID_TRANSACTION:Ljava/sql/RowIdLifetime;


# direct methods
.method static constructor <clinit>()V
    .locals 7

    .prologue
    const/4 v6, 0x4

    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 4
    new-instance v0, Ljava/sql/RowIdLifetime;

    const-string v1, "ROWID_UNSUPPORTED"

    invoke-direct {v0, v1, v2}, Ljava/sql/RowIdLifetime;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/sql/RowIdLifetime;->ROWID_UNSUPPORTED:Ljava/sql/RowIdLifetime;

    .line 5
    new-instance v0, Ljava/sql/RowIdLifetime;

    const-string v1, "ROWID_VALID_FOREVER"

    invoke-direct {v0, v1, v3}, Ljava/sql/RowIdLifetime;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/sql/RowIdLifetime;->ROWID_VALID_FOREVER:Ljava/sql/RowIdLifetime;

    .line 6
    new-instance v0, Ljava/sql/RowIdLifetime;

    const-string v1, "ROWID_VALID_OTHER"

    invoke-direct {v0, v1, v4}, Ljava/sql/RowIdLifetime;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/sql/RowIdLifetime;->ROWID_VALID_OTHER:Ljava/sql/RowIdLifetime;

    .line 7
    new-instance v0, Ljava/sql/RowIdLifetime;

    const-string v1, "ROWID_VALID_SESSION"

    invoke-direct {v0, v1, v5}, Ljava/sql/RowIdLifetime;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/sql/RowIdLifetime;->ROWID_VALID_SESSION:Ljava/sql/RowIdLifetime;

    .line 8
    new-instance v0, Ljava/sql/RowIdLifetime;

    const-string v1, "ROWID_VALID_TRANSACTION"

    invoke-direct {v0, v1, v6}, Ljava/sql/RowIdLifetime;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/sql/RowIdLifetime;->ROWID_VALID_TRANSACTION:Ljava/sql/RowIdLifetime;

    .line 2
    const/4 v0, 0x5

    new-array v0, v0, [Ljava/sql/RowIdLifetime;

    sget-object v1, Ljava/sql/RowIdLifetime;->ROWID_UNSUPPORTED:Ljava/sql/RowIdLifetime;

    aput-object v1, v0, v2

    sget-object v1, Ljava/sql/RowIdLifetime;->ROWID_VALID_FOREVER:Ljava/sql/RowIdLifetime;

    aput-object v1, v0, v3

    sget-object v1, Ljava/sql/RowIdLifetime;->ROWID_VALID_OTHER:Ljava/sql/RowIdLifetime;

    aput-object v1, v0, v4

    sget-object v1, Ljava/sql/RowIdLifetime;->ROWID_VALID_SESSION:Ljava/sql/RowIdLifetime;

    aput-object v1, v0, v5

    sget-object v1, Ljava/sql/RowIdLifetime;->ROWID_VALID_TRANSACTION:Ljava/sql/RowIdLifetime;

    aput-object v1, v0, v6

    sput-object v0, Ljava/sql/RowIdLifetime;->$VALUES:[Ljava/sql/RowIdLifetime;

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
    .line 2
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Ljava/sql/RowIdLifetime;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 2
    const-class v0, Ljava/sql/RowIdLifetime;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/sql/RowIdLifetime;

    return-object v0
.end method

.method public static values()[Ljava/sql/RowIdLifetime;
    .locals 1

    .prologue
    .line 2
    sget-object v0, Ljava/sql/RowIdLifetime;->$VALUES:[Ljava/sql/RowIdLifetime;

    invoke-virtual {v0}, [Ljava/sql/RowIdLifetime;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/sql/RowIdLifetime;

    return-object v0
.end method
