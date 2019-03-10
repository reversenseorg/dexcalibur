.class public interface abstract Ljava/sql/ParameterMetaData;
.super Ljava/lang/Object;
.source "ParameterMetaData.java"

# interfaces
.implements Ljava/sql/Wrapper;


# static fields
.field public static final parameterModeIn:I = 0x1

.field public static final parameterModeInOut:I = 0x2

.field public static final parameterModeOut:I = 0x4

.field public static final parameterModeUnknown:I = 0x0

.field public static final parameterNoNulls:I = 0x0

.field public static final parameterNullable:I = 0x1

.field public static final parameterNullableUnknown:I = 0x2


# virtual methods
.method public abstract getParameterClassName(I)Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getParameterCount()I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getParameterMode(I)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getParameterType(I)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getParameterTypeName(I)Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getPrecision(I)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getScale(I)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract isNullable(I)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract isSigned(I)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method
