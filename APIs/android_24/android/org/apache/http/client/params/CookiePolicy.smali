.class public final Lorg/apache/http/client/params/CookiePolicy;
.super Ljava/lang/Object;
.source "CookiePolicy.java"


# annotations
.annotation runtime Ljava/lang/Deprecated;
.end annotation


# static fields
.field public static final BEST_MATCH:Ljava/lang/String; = "best-match"

.field public static final BROWSER_COMPATIBILITY:Ljava/lang/String; = "compatibility"

.field public static final NETSCAPE:Ljava/lang/String; = "netscape"

.field public static final RFC_2109:Ljava/lang/String; = "rfc2109"

.field public static final RFC_2965:Ljava/lang/String; = "rfc2965"


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
