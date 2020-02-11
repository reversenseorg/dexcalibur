.class public Lsg/vantagepoint/uncrackable2/CodeCheck;
.super Ljava/lang/Object;


# direct methods
.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method private native bar([B)Z
.end method


# virtual methods
.method public a(Ljava/lang/String;)Z
    .locals 0

    invoke-virtual {p1}, Ljava/lang/String;->getBytes()[B

    move-result-object p1

    invoke-direct {p0, p1}, Lsg/vantagepoint/uncrackable2/CodeCheck;->bar([B)Z

    move-result p1

    return p1
.end method
