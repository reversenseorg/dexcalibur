.class public Landroid/text/style/TtsSpan$SemioticClassBuilder;
.super Landroid/text/style/TtsSpan$Builder;
.source "TtsSpan.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/text/style/TtsSpan;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "SemioticClassBuilder"
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "<C:",
        "Landroid/text/style/TtsSpan$SemioticClassBuilder",
        "<*>;>",
        "Landroid/text/style/TtsSpan$Builder",
        "<TC;>;"
    }
.end annotation


# direct methods
.method public constructor <init>(Ljava/lang/String;)V
    .locals 2
    .param p1, "type"    # Ljava/lang/String;

    .prologue
    .line 19
    .local p0, "this":Landroid/text/style/TtsSpan$SemioticClassBuilder;, "Landroid/text/style/TtsSpan$SemioticClassBuilder<TC;>;"
    const/4 v0, 0x0

    check-cast v0, Ljava/lang/String;

    invoke-direct {p0, v0}, Landroid/text/style/TtsSpan$Builder;-><init>(Ljava/lang/String;)V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public setAnimacy(Ljava/lang/String;)Landroid/text/style/TtsSpan$SemioticClassBuilder;
    .locals 2
    .param p1, "animacy"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            ")TC;"
        }
    .end annotation

    .prologue
    .line 21
    .local p0, "this":Landroid/text/style/TtsSpan$SemioticClassBuilder;, "Landroid/text/style/TtsSpan$SemioticClassBuilder<TC;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setCase(Ljava/lang/String;)Landroid/text/style/TtsSpan$SemioticClassBuilder;
    .locals 2
    .param p1, "grammaticalCase"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            ")TC;"
        }
    .end annotation

    .prologue
    .line 23
    .local p0, "this":Landroid/text/style/TtsSpan$SemioticClassBuilder;, "Landroid/text/style/TtsSpan$SemioticClassBuilder<TC;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setGender(Ljava/lang/String;)Landroid/text/style/TtsSpan$SemioticClassBuilder;
    .locals 2
    .param p1, "gender"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            ")TC;"
        }
    .end annotation

    .prologue
    .line 20
    .local p0, "this":Landroid/text/style/TtsSpan$SemioticClassBuilder;, "Landroid/text/style/TtsSpan$SemioticClassBuilder<TC;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method

.method public setMultiplicity(Ljava/lang/String;)Landroid/text/style/TtsSpan$SemioticClassBuilder;
    .locals 2
    .param p1, "multiplicity"    # Ljava/lang/String;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            ")TC;"
        }
    .end annotation

    .prologue
    .line 22
    .local p0, "this":Landroid/text/style/TtsSpan$SemioticClassBuilder;, "Landroid/text/style/TtsSpan$SemioticClassBuilder<TC;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
