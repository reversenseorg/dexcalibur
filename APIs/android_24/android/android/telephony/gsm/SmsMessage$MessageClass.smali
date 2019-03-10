.class public final enum Landroid/telephony/gsm/SmsMessage$MessageClass;
.super Ljava/lang/Enum;
.source "SmsMessage.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/telephony/gsm/SmsMessage;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x4019
    name = "MessageClass"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Landroid/telephony/gsm/SmsMessage$MessageClass;",
        ">;"
    }
.end annotation

.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field private static final synthetic $VALUES:[Landroid/telephony/gsm/SmsMessage$MessageClass;

.field public static final enum CLASS_0:Landroid/telephony/gsm/SmsMessage$MessageClass;

.field public static final enum CLASS_1:Landroid/telephony/gsm/SmsMessage$MessageClass;

.field public static final enum CLASS_2:Landroid/telephony/gsm/SmsMessage$MessageClass;

.field public static final enum CLASS_3:Landroid/telephony/gsm/SmsMessage$MessageClass;

.field public static final enum UNKNOWN:Landroid/telephony/gsm/SmsMessage$MessageClass;


# direct methods
.method static constructor <clinit>()V
    .locals 7

    .prologue
    const/4 v6, 0x4

    const/4 v5, 0x3

    const/4 v4, 0x2

    const/4 v3, 0x1

    const/4 v2, 0x0

    .line 8
    new-instance v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    const-string v1, "CLASS_0"

    invoke-direct {v0, v1, v2}, Landroid/telephony/gsm/SmsMessage$MessageClass;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_0:Landroid/telephony/gsm/SmsMessage$MessageClass;

    .line 9
    new-instance v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    const-string v1, "CLASS_1"

    invoke-direct {v0, v1, v3}, Landroid/telephony/gsm/SmsMessage$MessageClass;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_1:Landroid/telephony/gsm/SmsMessage$MessageClass;

    .line 10
    new-instance v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    const-string v1, "CLASS_2"

    invoke-direct {v0, v1, v4}, Landroid/telephony/gsm/SmsMessage$MessageClass;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_2:Landroid/telephony/gsm/SmsMessage$MessageClass;

    .line 11
    new-instance v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    const-string v1, "CLASS_3"

    invoke-direct {v0, v1, v5}, Landroid/telephony/gsm/SmsMessage$MessageClass;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_3:Landroid/telephony/gsm/SmsMessage$MessageClass;

    .line 12
    new-instance v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    const-string v1, "UNKNOWN"

    invoke-direct {v0, v1, v6}, Landroid/telephony/gsm/SmsMessage$MessageClass;-><init>(Ljava/lang/String;I)V

    sput-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->UNKNOWN:Landroid/telephony/gsm/SmsMessage$MessageClass;

    .line 5
    const/4 v0, 0x5

    new-array v0, v0, [Landroid/telephony/gsm/SmsMessage$MessageClass;

    sget-object v1, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_0:Landroid/telephony/gsm/SmsMessage$MessageClass;

    aput-object v1, v0, v2

    sget-object v1, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_1:Landroid/telephony/gsm/SmsMessage$MessageClass;

    aput-object v1, v0, v3

    sget-object v1, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_2:Landroid/telephony/gsm/SmsMessage$MessageClass;

    aput-object v1, v0, v4

    sget-object v1, Landroid/telephony/gsm/SmsMessage$MessageClass;->CLASS_3:Landroid/telephony/gsm/SmsMessage$MessageClass;

    aput-object v1, v0, v5

    sget-object v1, Landroid/telephony/gsm/SmsMessage$MessageClass;->UNKNOWN:Landroid/telephony/gsm/SmsMessage$MessageClass;

    aput-object v1, v0, v6

    sput-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->$VALUES:[Landroid/telephony/gsm/SmsMessage$MessageClass;

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

.method public static valueOf(Ljava/lang/String;)Landroid/telephony/gsm/SmsMessage$MessageClass;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 5
    const-class v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Landroid/telephony/gsm/SmsMessage$MessageClass;

    return-object v0
.end method

.method public static values()[Landroid/telephony/gsm/SmsMessage$MessageClass;
    .locals 1

    .prologue
    .line 5
    sget-object v0, Landroid/telephony/gsm/SmsMessage$MessageClass;->$VALUES:[Landroid/telephony/gsm/SmsMessage$MessageClass;

    invoke-virtual {v0}, [Landroid/telephony/gsm/SmsMessage$MessageClass;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Landroid/telephony/gsm/SmsMessage$MessageClass;

    return-object v0
.end method
