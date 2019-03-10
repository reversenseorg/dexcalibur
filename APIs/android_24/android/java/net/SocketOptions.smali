.class public interface abstract Ljava/net/SocketOptions;
.super Ljava/lang/Object;
.source "SocketOptions.java"


# static fields
.field public static final IP_MULTICAST_IF:I = 0x10

.field public static final IP_MULTICAST_IF2:I = 0x1f

.field public static final IP_MULTICAST_LOOP:I = 0x12

.field public static final IP_TOS:I = 0x3

.field public static final SO_BINDADDR:I = 0xf

.field public static final SO_BROADCAST:I = 0x20

.field public static final SO_KEEPALIVE:I = 0x8

.field public static final SO_LINGER:I = 0x80

.field public static final SO_OOBINLINE:I = 0x1003

.field public static final SO_RCVBUF:I = 0x1002

.field public static final SO_REUSEADDR:I = 0x4

.field public static final SO_SNDBUF:I = 0x1001

.field public static final SO_TIMEOUT:I = 0x1006

.field public static final TCP_NODELAY:I = 0x1


# virtual methods
.method public abstract getOption(I)Ljava/lang/Object;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/net/SocketException;
        }
    .end annotation
.end method

.method public abstract setOption(ILjava/lang/Object;)V
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/net/SocketException;
        }
    .end annotation
.end method
