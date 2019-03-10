.class public Ljava/text/DateFormat$Field;
.super Ljava/text/Format$Field;
.source "DateFormat.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Ljava/text/DateFormat;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "Field"
.end annotation


# static fields
.field public static final AM_PM:Ljava/text/DateFormat$Field;

.field public static final DAY_OF_MONTH:Ljava/text/DateFormat$Field;

.field public static final DAY_OF_WEEK:Ljava/text/DateFormat$Field;

.field public static final DAY_OF_WEEK_IN_MONTH:Ljava/text/DateFormat$Field;

.field public static final DAY_OF_YEAR:Ljava/text/DateFormat$Field;

.field public static final ERA:Ljava/text/DateFormat$Field;

.field public static final HOUR0:Ljava/text/DateFormat$Field;

.field public static final HOUR1:Ljava/text/DateFormat$Field;

.field public static final HOUR_OF_DAY0:Ljava/text/DateFormat$Field;

.field public static final HOUR_OF_DAY1:Ljava/text/DateFormat$Field;

.field public static final MILLISECOND:Ljava/text/DateFormat$Field;

.field public static final MINUTE:Ljava/text/DateFormat$Field;

.field public static final MONTH:Ljava/text/DateFormat$Field;

.field public static final SECOND:Ljava/text/DateFormat$Field;

.field public static final TIME_ZONE:Ljava/text/DateFormat$Field;

.field public static final WEEK_OF_MONTH:Ljava/text/DateFormat$Field;

.field public static final WEEK_OF_YEAR:Ljava/text/DateFormat$Field;

.field public static final YEAR:Ljava/text/DateFormat$Field;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 29
    sput-object v0, Ljava/text/DateFormat$Field;->AM_PM:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->DAY_OF_MONTH:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->DAY_OF_WEEK:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->DAY_OF_WEEK_IN_MONTH:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->DAY_OF_YEAR:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->ERA:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->HOUR0:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->HOUR1:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->HOUR_OF_DAY0:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->HOUR_OF_DAY1:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->MILLISECOND:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->MINUTE:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->MONTH:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->SECOND:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->TIME_ZONE:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->WEEK_OF_MONTH:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->WEEK_OF_YEAR:Ljava/text/DateFormat$Field;

    sput-object v0, Ljava/text/DateFormat$Field;->YEAR:Ljava/text/DateFormat$Field;

    return-void
.end method

.method protected constructor <init>(Ljava/lang/String;I)V
    .locals 2
    .param p1, "fieldName"    # Ljava/lang/String;
    .param p2, "calendarField"    # I

    .prologue
    .line 8
    const/4 v0, 0x0

    check-cast v0, Ljava/lang/String;

    invoke-direct {p0, v0}, Ljava/text/Format$Field;-><init>(Ljava/lang/String;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static ofCalendarField(I)Ljava/text/DateFormat$Field;
    .locals 2
    .param p0, "calendarField"    # I

    .prologue
    .line 10
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getCalendarField()I
    .locals 2

    .prologue
    .line 9
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
