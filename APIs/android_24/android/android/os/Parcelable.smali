.class public interface abstract Landroid/os/Parcelable;
.super Ljava/lang/Object;
.source "Parcelable.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/os/Parcelable$ClassLoaderCreator;,
        Landroid/os/Parcelable$Creator;
    }
.end annotation


# static fields
.field public static final CONTENTS_FILE_DESCRIPTOR:I = 0x1

.field public static final PARCELABLE_WRITE_RETURN_VALUE:I = 0x1


# virtual methods
.method public abstract describeContents()I
.end method

.method public abstract writeToParcel(Landroid/os/Parcel;I)V
.end method
