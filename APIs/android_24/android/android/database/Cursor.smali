.class public interface abstract Landroid/database/Cursor;
.super Ljava/lang/Object;
.source "Cursor.java"

# interfaces
.implements Ljava/io/Closeable;


# static fields
.field public static final FIELD_TYPE_BLOB:I = 0x4

.field public static final FIELD_TYPE_FLOAT:I = 0x2

.field public static final FIELD_TYPE_INTEGER:I = 0x1

.field public static final FIELD_TYPE_NULL:I = 0x0

.field public static final FIELD_TYPE_STRING:I = 0x3


# virtual methods
.method public abstract close()V
.end method

.method public abstract copyStringToBuffer(ILandroid/database/CharArrayBuffer;)V
.end method

.method public abstract deactivate()V
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end method

.method public abstract getBlob(I)[B
.end method

.method public abstract getColumnCount()I
.end method

.method public abstract getColumnIndex(Ljava/lang/String;)I
.end method

.method public abstract getColumnIndexOrThrow(Ljava/lang/String;)I
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/IllegalArgumentException;
        }
    .end annotation
.end method

.method public abstract getColumnName(I)Ljava/lang/String;
.end method

.method public abstract getColumnNames()[Ljava/lang/String;
.end method

.method public abstract getCount()I
.end method

.method public abstract getDouble(I)D
.end method

.method public abstract getExtras()Landroid/os/Bundle;
.end method

.method public abstract getFloat(I)F
.end method

.method public abstract getInt(I)I
.end method

.method public abstract getLong(I)J
.end method

.method public abstract getNotificationUri()Landroid/net/Uri;
.end method

.method public abstract getPosition()I
.end method

.method public abstract getShort(I)S
.end method

.method public abstract getString(I)Ljava/lang/String;
.end method

.method public abstract getType(I)I
.end method

.method public abstract getWantsAllOnMoveCalls()Z
.end method

.method public abstract isAfterLast()Z
.end method

.method public abstract isBeforeFirst()Z
.end method

.method public abstract isClosed()Z
.end method

.method public abstract isFirst()Z
.end method

.method public abstract isLast()Z
.end method

.method public abstract isNull(I)Z
.end method

.method public abstract move(I)Z
.end method

.method public abstract moveToFirst()Z
.end method

.method public abstract moveToLast()Z
.end method

.method public abstract moveToNext()Z
.end method

.method public abstract moveToPosition(I)Z
.end method

.method public abstract moveToPrevious()Z
.end method

.method public abstract registerContentObserver(Landroid/database/ContentObserver;)V
.end method

.method public abstract registerDataSetObserver(Landroid/database/DataSetObserver;)V
.end method

.method public abstract requery()Z
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end method

.method public abstract respond(Landroid/os/Bundle;)Landroid/os/Bundle;
.end method

.method public abstract setNotificationUri(Landroid/content/ContentResolver;Landroid/net/Uri;)V
.end method

.method public abstract unregisterContentObserver(Landroid/database/ContentObserver;)V
.end method

.method public abstract unregisterDataSetObserver(Landroid/database/DataSetObserver;)V
.end method
