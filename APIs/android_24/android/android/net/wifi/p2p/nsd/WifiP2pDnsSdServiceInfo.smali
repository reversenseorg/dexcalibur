.class public Landroid/net/wifi/p2p/nsd/WifiP2pDnsSdServiceInfo;
.super Landroid/net/wifi/p2p/nsd/WifiP2pServiceInfo;
.source "WifiP2pDnsSdServiceInfo.java"


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 5
    invoke-direct {p0}, Landroid/net/wifi/p2p/nsd/WifiP2pServiceInfo;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public static newInstance(Ljava/lang/String;Ljava/lang/String;Ljava/util/Map;)Landroid/net/wifi/p2p/nsd/WifiP2pDnsSdServiceInfo;
    .locals 2
    .param p0, "instanceName"    # Ljava/lang/String;
    .param p1, "serviceType"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            "Ljava/lang/String;",
            "Ljava/util/Map",
            "<",
            "Ljava/lang/String;",
            "Ljava/lang/String;",
            ">;)",
            "Landroid/net/wifi/p2p/nsd/WifiP2pDnsSdServiceInfo;"
        }
    .end annotation

    .prologue
    .line 6
    .local p2, "txtMap":Ljava/util/Map;, "Ljava/util/Map<Ljava/lang/String;Ljava/lang/String;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
