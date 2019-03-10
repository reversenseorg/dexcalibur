.class public interface abstract Landroid/os/IBinder;
.super Ljava/lang/Object;
.source "IBinder.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Landroid/os/IBinder$DeathRecipient;
    }
.end annotation


# static fields
.field public static final DUMP_TRANSACTION:I = 0x5f444d50

.field public static final FIRST_CALL_TRANSACTION:I = 0x1

.field public static final FLAG_ONEWAY:I = 0x1

.field public static final INTERFACE_TRANSACTION:I = 0x5f4e5446

.field public static final LAST_CALL_TRANSACTION:I = 0xffffff

.field public static final LIKE_TRANSACTION:I = 0x5f4c494b

.field public static final PING_TRANSACTION:I = 0x5f504e47

.field public static final TWEET_TRANSACTION:I = 0x5f545754


# virtual methods
.method public abstract dump(Ljava/io/FileDescriptor;[Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/os/RemoteException;
        }
    .end annotation
.end method

.method public abstract dumpAsync(Ljava/io/FileDescriptor;[Ljava/lang/String;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/os/RemoteException;
        }
    .end annotation
.end method

.method public abstract getInterfaceDescriptor()Ljava/lang/String;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/os/RemoteException;
        }
    .end annotation
.end method

.method public abstract isBinderAlive()Z
.end method

.method public abstract linkToDeath(Landroid/os/IBinder$DeathRecipient;I)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/os/RemoteException;
        }
    .end annotation
.end method

.method public abstract pingBinder()Z
.end method

.method public abstract queryLocalInterface(Ljava/lang/String;)Landroid/os/IInterface;
.end method

.method public abstract transact(ILandroid/os/Parcel;Landroid/os/Parcel;I)Z
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Landroid/os/RemoteException;
        }
    .end annotation
.end method

.method public abstract unlinkToDeath(Landroid/os/IBinder$DeathRecipient;I)Z
.end method
