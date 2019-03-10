.class public final Ldalvik/bytecode/OpcodeInfo;
.super Ljava/lang/Object;
.source "OpcodeInfo.java"


# static fields
.field public static final MAXIMUM_PACKED_VALUE:I

.field public static final MAXIMUM_VALUE:I


# direct methods
.method static constructor <clinit>()V
    .locals 1

    .prologue
    const/4 v0, 0x0

    .line 7
    sput v0, Ldalvik/bytecode/OpcodeInfo;->MAXIMUM_PACKED_VALUE:I

    sput v0, Ldalvik/bytecode/OpcodeInfo;->MAXIMUM_VALUE:I

    return-void
.end method

.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
