.class public interface abstract Landroid/content/SharedPreferences$Editor;
.super Ljava/lang/Object;
.source "SharedPreferences.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Landroid/content/SharedPreferences;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x609
    name = "Editor"
.end annotation


# virtual methods
.method public abstract apply()V
.end method

.method public abstract clear()Landroid/content/SharedPreferences$Editor;
.end method

.method public abstract commit()Z
.end method

.method public abstract putBoolean(Ljava/lang/String;Z)Landroid/content/SharedPreferences$Editor;
.end method

.method public abstract putFloat(Ljava/lang/String;F)Landroid/content/SharedPreferences$Editor;
.end method

.method public abstract putInt(Ljava/lang/String;I)Landroid/content/SharedPreferences$Editor;
.end method

.method public abstract putLong(Ljava/lang/String;J)Landroid/content/SharedPreferences$Editor;
.end method

.method public abstract putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;
.end method

.method public abstract putStringSet(Ljava/lang/String;Ljava/util/Set;)Landroid/content/SharedPreferences$Editor;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/String;",
            "Ljava/util/Set",
            "<",
            "Ljava/lang/String;",
            ">;)",
            "Landroid/content/SharedPreferences$Editor;"
        }
    .end annotation
.end method

.method public abstract remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;
.end method
