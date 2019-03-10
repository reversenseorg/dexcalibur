.class public interface abstract Ljava/sql/Driver;
.super Ljava/lang/Object;
.source "Driver.java"


# virtual methods
.method public abstract acceptsURL(Ljava/lang/String;)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract connect(Ljava/lang/String;Ljava/util/Properties;)Ljava/sql/Connection;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract getMajorVersion()I
.end method

.method public abstract getMinorVersion()I
.end method

.method public abstract getPropertyInfo(Ljava/lang/String;Ljava/util/Properties;)[Ljava/sql/DriverPropertyInfo;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/sql/SQLException;
        }
    .end annotation
.end method

.method public abstract jdbcCompliant()Z
.end method
