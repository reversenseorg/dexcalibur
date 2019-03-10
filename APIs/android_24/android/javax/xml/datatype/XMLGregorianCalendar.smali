.class public abstract Ljavax/xml/datatype/XMLGregorianCalendar;
.super Ljava/lang/Object;
.source "XMLGregorianCalendar.java"

# interfaces
.implements Ljava/lang/Cloneable;


# direct methods
.method public constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public abstract add(Ljavax/xml/datatype/Duration;)V
.end method

.method public abstract clear()V
.end method

.method public abstract clone()Ljava/lang/Object;
.end method

.method public abstract compare(Ljavax/xml/datatype/XMLGregorianCalendar;)I
.end method

.method public equals(Ljava/lang/Object;)Z
    .locals 2
    .param p1, "obj"    # Ljava/lang/Object;

    .prologue
    .line 34
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract getDay()I
.end method

.method public abstract getEon()Ljava/math/BigInteger;
.end method

.method public abstract getEonAndYear()Ljava/math/BigInteger;
.end method

.method public abstract getFractionalSecond()Ljava/math/BigDecimal;
.end method

.method public abstract getHour()I
.end method

.method public getMillisecond()I
    .locals 2

    .prologue
    .line 30
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract getMinute()I
.end method

.method public abstract getMonth()I
.end method

.method public abstract getSecond()I
.end method

.method public abstract getTimeZone(I)Ljava/util/TimeZone;
.end method

.method public abstract getTimezone()I
.end method

.method public abstract getXMLSchemaType()Ljavax/xml/namespace/QName;
.end method

.method public abstract getYear()I
.end method

.method public hashCode()I
    .locals 2

    .prologue
    .line 35
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract isValid()Z
.end method

.method public abstract normalize()Ljavax/xml/datatype/XMLGregorianCalendar;
.end method

.method public abstract reset()V
.end method

.method public abstract setDay(I)V
.end method

.method public abstract setFractionalSecond(Ljava/math/BigDecimal;)V
.end method

.method public abstract setHour(I)V
.end method

.method public abstract setMillisecond(I)V
.end method

.method public abstract setMinute(I)V
.end method

.method public abstract setMonth(I)V
.end method

.method public abstract setSecond(I)V
.end method

.method public setTime(III)V
    .locals 2
    .param p1, "hour"    # I
    .param p2, "minute"    # I
    .param p3, "second"    # I

    .prologue
    .line 13
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setTime(IIII)V
    .locals 2
    .param p1, "hour"    # I
    .param p2, "minute"    # I
    .param p3, "second"    # I
    .param p4, "millisecond"    # I

    .prologue
    .line 20
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setTime(IIILjava/math/BigDecimal;)V
    .locals 2
    .param p1, "hour"    # I
    .param p2, "minute"    # I
    .param p3, "second"    # I
    .param p4, "fractional"    # Ljava/math/BigDecimal;

    .prologue
    .line 19
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract setTimezone(I)V
.end method

.method public abstract setYear(I)V
.end method

.method public abstract setYear(Ljava/math/BigInteger;)V
.end method

.method public abstract toGregorianCalendar()Ljava/util/GregorianCalendar;
.end method

.method public abstract toGregorianCalendar(Ljava/util/TimeZone;Ljava/util/Locale;Ljavax/xml/datatype/XMLGregorianCalendar;)Ljava/util/GregorianCalendar;
.end method

.method public toString()Ljava/lang/String;
    .locals 2

    .prologue
    .line 38
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public abstract toXMLFormat()Ljava/lang/String;
.end method
