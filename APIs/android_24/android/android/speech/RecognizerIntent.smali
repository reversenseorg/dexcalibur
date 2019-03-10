.class public Landroid/speech/RecognizerIntent;
.super Ljava/lang/Object;
.source "RecognizerIntent.java"


# static fields
.field public static final ACTION_GET_LANGUAGE_DETAILS:Ljava/lang/String; = "android.speech.action.GET_LANGUAGE_DETAILS"

.field public static final ACTION_RECOGNIZE_SPEECH:Ljava/lang/String; = "android.speech.action.RECOGNIZE_SPEECH"

.field public static final ACTION_VOICE_SEARCH_HANDS_FREE:Ljava/lang/String; = "android.speech.action.VOICE_SEARCH_HANDS_FREE"

.field public static final ACTION_WEB_SEARCH:Ljava/lang/String; = "android.speech.action.WEB_SEARCH"

.field public static final DETAILS_META_DATA:Ljava/lang/String; = "android.speech.DETAILS"

.field public static final EXTRA_CALLING_PACKAGE:Ljava/lang/String; = "calling_package"

.field public static final EXTRA_CONFIDENCE_SCORES:Ljava/lang/String; = "android.speech.extra.CONFIDENCE_SCORES"

.field public static final EXTRA_LANGUAGE:Ljava/lang/String; = "android.speech.extra.LANGUAGE"

.field public static final EXTRA_LANGUAGE_MODEL:Ljava/lang/String; = "android.speech.extra.LANGUAGE_MODEL"

.field public static final EXTRA_LANGUAGE_PREFERENCE:Ljava/lang/String; = "android.speech.extra.LANGUAGE_PREFERENCE"

.field public static final EXTRA_MAX_RESULTS:Ljava/lang/String; = "android.speech.extra.MAX_RESULTS"

.field public static final EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE:Ljava/lang/String; = "android.speech.extra.ONLY_RETURN_LANGUAGE_PREFERENCE"

.field public static final EXTRA_ORIGIN:Ljava/lang/String; = "android.speech.extra.ORIGIN"

.field public static final EXTRA_PARTIAL_RESULTS:Ljava/lang/String; = "android.speech.extra.PARTIAL_RESULTS"

.field public static final EXTRA_PROMPT:Ljava/lang/String; = "android.speech.extra.PROMPT"

.field public static final EXTRA_RESULTS:Ljava/lang/String; = "android.speech.extra.RESULTS"

.field public static final EXTRA_RESULTS_PENDINGINTENT:Ljava/lang/String; = "android.speech.extra.RESULTS_PENDINGINTENT"

.field public static final EXTRA_RESULTS_PENDINGINTENT_BUNDLE:Ljava/lang/String; = "android.speech.extra.RESULTS_PENDINGINTENT_BUNDLE"

.field public static final EXTRA_SECURE:Ljava/lang/String; = "android.speech.extras.EXTRA_SECURE"

.field public static final EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS:Ljava/lang/String; = "android.speech.extras.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS"

.field public static final EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS:Ljava/lang/String; = "android.speech.extras.SPEECH_INPUT_MINIMUM_LENGTH_MILLIS"

.field public static final EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS:Ljava/lang/String; = "android.speech.extras.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS"

.field public static final EXTRA_SUPPORTED_LANGUAGES:Ljava/lang/String; = "android.speech.extra.SUPPORTED_LANGUAGES"

.field public static final EXTRA_WEB_SEARCH_ONLY:Ljava/lang/String; = "android.speech.extra.WEB_SEARCH_ONLY"

.field public static final LANGUAGE_MODEL_FREE_FORM:Ljava/lang/String; = "free_form"

.field public static final LANGUAGE_MODEL_WEB_SEARCH:Ljava/lang/String; = "web_search"

.field public static final RESULT_AUDIO_ERROR:I = 0x5

.field public static final RESULT_CLIENT_ERROR:I = 0x2

.field public static final RESULT_NETWORK_ERROR:I = 0x4

.field public static final RESULT_NO_MATCH:I = 0x1

.field public static final RESULT_SERVER_ERROR:I = 0x3


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

.method public static final getVoiceDetailsIntent(Landroid/content/Context;)Landroid/content/Intent;
    .locals 2
    .param p0, "context"    # Landroid/content/Context;

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
