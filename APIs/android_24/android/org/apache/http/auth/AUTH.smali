.class public final Lorg/apache/http/auth/AUTH;
.super Ljava/lang/Object;
.source "AUTH.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final PROXY_AUTH:Ljava/lang/String; = "Proxy-Authenticate"

.field public static final PROXY_AUTH_RESP:Ljava/lang/String; = "Proxy-Authorization"

.field public static final WWW_AUTH:Ljava/lang/String; = "WWW-Authenticate"

.field public static final WWW_AUTH_RESP:Ljava/lang/String; = "Authorization"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
