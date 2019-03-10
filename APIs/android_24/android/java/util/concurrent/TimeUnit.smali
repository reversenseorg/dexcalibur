.class public final enum Ljava/util/concurrent/TimeUnit;
.super Ljava/lang/Enum;
.source "TimeUnit.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/lang/Enum",
        "<",
        "Ljava/util/concurrent/TimeUnit;",
        ">;"
    }
.end annotation


# static fields
.field private static final synthetic $VALUES:[Ljava/util/concurrent/TimeUnit;

.field public static final enum DAYS:Ljava/util/concurrent/TimeUnit;

.field public static final enum HOURS:Ljava/util/concurrent/TimeUnit;

.field public static final enum MICROSECONDS:Ljava/util/concurrent/TimeUnit;

.field public static final enum MILLISECONDS:Ljava/util/concurrent/TimeUnit;

.field public static final enum MINUTES:Ljava/util/concurrent/TimeUnit;

.field public static final enum NANOSECONDS:Ljava/util/concurrent/TimeUnit;

.field public static final enum SECONDS:Ljava/util/concurrent/TimeUnit;


# direct methods
.method static constructor <clinit>()V
    .locals 8

    .prologue
    const/4 v7, 0x4

    const/4 v6, 0x3

    const/4 v5, 0x2

    const/4 v4, 0x1

    const/4 v3, 0x0

    .line 4
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "DAYS"

    invoke-direct {v0, v1, v3}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->DAYS:Ljava/util/concurrent/TimeUnit;

    .line 5
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "HOURS"

    invoke-direct {v0, v1, v4}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->HOURS:Ljava/util/concurrent/TimeUnit;

    .line 6
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "MICROSECONDS"

    invoke-direct {v0, v1, v5}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->MICROSECONDS:Ljava/util/concurrent/TimeUnit;

    .line 7
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "MILLISECONDS"

    invoke-direct {v0, v1, v6}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->MILLISECONDS:Ljava/util/concurrent/TimeUnit;

    .line 8
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "MINUTES"

    invoke-direct {v0, v1, v7}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->MINUTES:Ljava/util/concurrent/TimeUnit;

    .line 9
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "NANOSECONDS"

    const/4 v2, 0x5

    invoke-direct {v0, v1, v2}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->NANOSECONDS:Ljava/util/concurrent/TimeUnit;

    .line 10
    new-instance v0, Ljava/util/concurrent/TimeUnit;

    const-string v1, "SECONDS"

    const/4 v2, 0x6

    invoke-direct {v0, v1, v2}, Ljava/util/concurrent/TimeUnit;-><init>(Ljava/lang/String;I)V

    sput-object v0, Ljava/util/concurrent/TimeUnit;->SECONDS:Ljava/util/concurrent/TimeUnit;

    .line 2
    const/4 v0, 0x7

    new-array v0, v0, [Ljava/util/concurrent/TimeUnit;

    sget-object v1, Ljava/util/concurrent/TimeUnit;->DAYS:Ljava/util/concurrent/TimeUnit;

    aput-object v1, v0, v3

    sget-object v1, Ljava/util/concurrent/TimeUnit;->HOURS:Ljava/util/concurrent/TimeUnit;

    aput-object v1, v0, v4

    sget-object v1, Ljava/util/concurrent/TimeUnit;->MICROSECONDS:Ljava/util/concurrent/TimeUnit;

    aput-object v1, v0, v5

    sget-object v1, Ljava/util/concurrent/TimeUnit;->MILLISECONDS:Ljava/util/concurrent/TimeUnit;

    aput-object v1, v0, v6

    sget-object v1, Ljava/util/concurrent/TimeUnit;->MINUTES:Ljava/util/concurrent/TimeUnit;

    aput-object v1, v0, v7

    const/4 v1, 0x5

    sget-object v2, Ljava/util/concurrent/TimeUnit;->NANOSECONDS:Ljava/util/concurrent/TimeUnit;

    aput-object v2, v0, v1

    const/4 v1, 0x6

    sget-object v2, Ljava/util/concurrent/TimeUnit;->SECONDS:Ljava/util/concurrent/TimeUnit;

    aput-object v2, v0, v1

    sput-object v0, Ljava/util/concurrent/TimeUnit;->$VALUES:[Ljava/util/concurrent/TimeUnit;

    return-void
.end method

.method private constructor <init>(Ljava/lang/String;I)V
    .locals 0
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()V"
        }
    .end annotation

    .prologue
    .line 2
    invoke-direct {p0, p1, p2}, Ljava/lang/Enum;-><init>(Ljava/lang/String;I)V

    return-void
.end method

.method public static valueOf(Ljava/lang/String;)Ljava/util/concurrent/TimeUnit;
    .locals 1
    .param p0, "name"    # Ljava/lang/String;

    .prologue
    .line 2
    const-class v0, Ljava/util/concurrent/TimeUnit;

    invoke-static {v0, p0}, Ljava/lang/Enum;->valueOf(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;

    move-result-object v0

    check-cast v0, Ljava/util/concurrent/TimeUnit;

    return-object v0
.end method

.method public static values()[Ljava/util/concurrent/TimeUnit;
    .locals 1

    .prologue
    .line 2
    sget-object v0, Ljava/util/concurrent/TimeUnit;->$VALUES:[Ljava/util/concurrent/TimeUnit;

    invoke-virtual {v0}, [Ljava/util/concurrent/TimeUnit;->clone()Ljava/lang/Object;

    move-result-object v0

    check-cast v0, [Ljava/util/concurrent/TimeUnit;

    return-object v0
.end method


# virtual methods
.method public convert(JLjava/util/concurrent/TimeUnit;)J
    .locals 2
    .param p1, "sourceDuration"    # J
    .param p3, "sourceUnit"    # Ljava/util/concurrent/TimeUnit;

    .prologue
    .line 11
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public sleep(J)V
    .locals 2
    .param p1, "timeout"    # J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/InterruptedException;
        }
    .end annotation

    .prologue
    .line 21
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public timedJoin(Ljava/lang/Thread;J)V
    .locals 2
    .param p1, "thread"    # Ljava/lang/Thread;
    .param p2, "timeout"    # J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/InterruptedException;
        }
    .end annotation

    .prologue
    .line 20
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public timedWait(Ljava/lang/Object;J)V
    .locals 2
    .param p1, "obj"    # Ljava/lang/Object;
    .param p2, "timeout"    # J
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/InterruptedException;
        }
    .end annotation

    .prologue
    .line 19
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toDays(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 18
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toHours(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 17
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toMicros(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 13
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toMillis(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 14
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toMinutes(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 16
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toNanos(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 12
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public toSeconds(J)J
    .locals 2
    .param p1, "duration"    # J

    .prologue
    .line 15
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
