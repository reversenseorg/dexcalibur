.class public interface abstract Ljava/net/CookiePolicy;
.super Ljava/lang/Object;
.source "CookiePolicy.java"


# static fields
.field public static final ACCEPT_ALL:Ljava/net/CookiePolicy;

.field public static final ACCEPT_NONE:Ljava/net/CookiePolicy;

.field public static final ACCEPT_ORIGINAL_SERVER:Ljava/net/CookiePolicy;


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 5
    sput-object v0, Ljava/net/CookiePolicy;->ACCEPT_ALL:Ljava/net/CookiePolicy;

    .line 6
    sput-object v0, Ljava/net/CookiePolicy;->ACCEPT_NONE:Ljava/net/CookiePolicy;

    .line 7
    sput-object v0, Ljava/net/CookiePolicy;->ACCEPT_ORIGINAL_SERVER:Ljava/net/CookiePolicy;

    return-void
.end method


# virtual methods
.method public abstract shouldAccept(Ljava/net/URI;Ljava/net/HttpCookie;)Z
.end method
