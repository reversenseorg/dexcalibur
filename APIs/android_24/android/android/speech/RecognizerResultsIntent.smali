.class public Landroid/speech/RecognizerResultsIntent;
.super Ljava/lang/Object;
.source "RecognizerResultsIntent.java"


# static fields
.field public static final ACTION_VOICE_SEARCH_RESULTS:Ljava/lang/String; = "android.speech.action.VOICE_SEARCH_RESULTS"

.field public static final EXTRA_VOICE_SEARCH_RESULT_HTML:Ljava/lang/String; = "android.speech.extras.VOICE_SEARCH_RESULT_HTML"

.field public static final EXTRA_VOICE_SEARCH_RESULT_HTML_BASE_URLS:Ljava/lang/String; = "android.speech.extras.VOICE_SEARCH_RESULT_HTML_BASE_URLS"

.field public static final EXTRA_VOICE_SEARCH_RESULT_HTTP_HEADERS:Ljava/lang/String; = "android.speech.extras.EXTRA_VOICE_SEARCH_RESULT_HTTP_HEADERS"

.field public static final EXTRA_VOICE_SEARCH_RESULT_STRINGS:Ljava/lang/String; = "android.speech.extras.VOICE_SEARCH_RESULT_STRINGS"

.field public static final EXTRA_VOICE_SEARCH_RESULT_URLS:Ljava/lang/String; = "android.speech.extras.VOICE_SEARCH_RESULT_URLS"

.field public static final URI_SCHEME_INLINE:Ljava/lang/String; = "inline"


# direct methods
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
