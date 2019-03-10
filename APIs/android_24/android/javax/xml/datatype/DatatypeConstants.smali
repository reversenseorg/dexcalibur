.class public final Ljavax/xml/datatype/DatatypeConstants;
.super Ljava/lang/Object;
.source "DatatypeConstants.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Ljavax/xml/datatype/DatatypeConstants$Field;
    }
.end annotation


# static fields
.field public static final APRIL:I = 0x4

.field public static final AUGUST:I = 0x8

.field public static final DATE:Ljavax/xml/namespace/QName;

.field public static final DATETIME:Ljavax/xml/namespace/QName;

.field public static final DAYS:Ljavax/xml/datatype/DatatypeConstants$Field;

.field public static final DECEMBER:I = 0xc

.field public static final DURATION:Ljavax/xml/namespace/QName;

.field public static final DURATION_DAYTIME:Ljavax/xml/namespace/QName;

.field public static final DURATION_YEARMONTH:Ljavax/xml/namespace/QName;

.field public static final EQUAL:I = 0x0

.field public static final FEBRUARY:I = 0x2

.field public static final FIELD_UNDEFINED:I = -0x80000000

.field public static final GDAY:Ljavax/xml/namespace/QName;

.field public static final GMONTH:Ljavax/xml/namespace/QName;

.field public static final GMONTHDAY:Ljavax/xml/namespace/QName;

.field public static final GREATER:I = 0x1

.field public static final GYEAR:Ljavax/xml/namespace/QName;

.field public static final GYEARMONTH:Ljavax/xml/namespace/QName;

.field public static final HOURS:Ljavax/xml/datatype/DatatypeConstants$Field;

.field public static final INDETERMINATE:I = 0x2

.field public static final JANUARY:I = 0x1

.field public static final JULY:I = 0x7

.field public static final JUNE:I = 0x6

.field public static final LESSER:I = -0x1

.field public static final MARCH:I = 0x3

.field public static final MAX_TIMEZONE_OFFSET:I = -0x348

.field public static final MAY:I = 0x5

.field public static final MINUTES:Ljavax/xml/datatype/DatatypeConstants$Field;

.field public static final MIN_TIMEZONE_OFFSET:I = 0x348

.field public static final MONTHS:Ljavax/xml/datatype/DatatypeConstants$Field;

.field public static final NOVEMBER:I = 0xb

.field public static final OCTOBER:I = 0xa

.field public static final SECONDS:Ljavax/xml/datatype/DatatypeConstants$Field;

.field public static final SEPTEMBER:I = 0x9

.field public static final TIME:Ljavax/xml/namespace/QName;

.field public static final YEARS:Ljavax/xml/datatype/DatatypeConstants$Field;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 47
    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->DATE:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->DATETIME:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->DAYS:Ljavax/xml/datatype/DatatypeConstants$Field;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->DURATION:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->DURATION_DAYTIME:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->DURATION_YEARMONTH:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->GDAY:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->GMONTH:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->GMONTHDAY:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->GYEAR:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->GYEARMONTH:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->HOURS:Ljavax/xml/datatype/DatatypeConstants$Field;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->MINUTES:Ljavax/xml/datatype/DatatypeConstants$Field;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->MONTHS:Ljavax/xml/datatype/DatatypeConstants$Field;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->SECONDS:Ljavax/xml/datatype/DatatypeConstants$Field;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->TIME:Ljavax/xml/namespace/QName;

    sput-object v0, Ljavax/xml/datatype/DatatypeConstants;->YEARS:Ljavax/xml/datatype/DatatypeConstants$Field;

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 10
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
