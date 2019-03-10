.class public Landroid/media/effect/EffectFactory;
.super Ljava/lang/Object;
.source "EffectFactory.java"


# static fields
.field public static final EFFECT_AUTOFIX:Ljava/lang/String; = "android.media.effect.effects.AutoFixEffect"

.field public static final EFFECT_BACKDROPPER:Ljava/lang/String; = "android.media.effect.effects.BackDropperEffect"

.field public static final EFFECT_BITMAPOVERLAY:Ljava/lang/String; = "android.media.effect.effects.BitmapOverlayEffect"

.field public static final EFFECT_BLACKWHITE:Ljava/lang/String; = "android.media.effect.effects.BlackWhiteEffect"

.field public static final EFFECT_BRIGHTNESS:Ljava/lang/String; = "android.media.effect.effects.BrightnessEffect"

.field public static final EFFECT_CONTRAST:Ljava/lang/String; = "android.media.effect.effects.ContrastEffect"

.field public static final EFFECT_CROP:Ljava/lang/String; = "android.media.effect.effects.CropEffect"

.field public static final EFFECT_CROSSPROCESS:Ljava/lang/String; = "android.media.effect.effects.CrossProcessEffect"

.field public static final EFFECT_DOCUMENTARY:Ljava/lang/String; = "android.media.effect.effects.DocumentaryEffect"

.field public static final EFFECT_DUOTONE:Ljava/lang/String; = "android.media.effect.effects.DuotoneEffect"

.field public static final EFFECT_FILLLIGHT:Ljava/lang/String; = "android.media.effect.effects.FillLightEffect"

.field public static final EFFECT_FISHEYE:Ljava/lang/String; = "android.media.effect.effects.FisheyeEffect"

.field public static final EFFECT_FLIP:Ljava/lang/String; = "android.media.effect.effects.FlipEffect"

.field public static final EFFECT_GRAIN:Ljava/lang/String; = "android.media.effect.effects.GrainEffect"

.field public static final EFFECT_GRAYSCALE:Ljava/lang/String; = "android.media.effect.effects.GrayscaleEffect"

.field public static final EFFECT_LOMOISH:Ljava/lang/String; = "android.media.effect.effects.LomoishEffect"

.field public static final EFFECT_NEGATIVE:Ljava/lang/String; = "android.media.effect.effects.NegativeEffect"

.field public static final EFFECT_POSTERIZE:Ljava/lang/String; = "android.media.effect.effects.PosterizeEffect"

.field public static final EFFECT_REDEYE:Ljava/lang/String; = "android.media.effect.effects.RedEyeEffect"

.field public static final EFFECT_ROTATE:Ljava/lang/String; = "android.media.effect.effects.RotateEffect"

.field public static final EFFECT_SATURATE:Ljava/lang/String; = "android.media.effect.effects.SaturateEffect"

.field public static final EFFECT_SEPIA:Ljava/lang/String; = "android.media.effect.effects.SepiaEffect"

.field public static final EFFECT_SHARPEN:Ljava/lang/String; = "android.media.effect.effects.SharpenEffect"

.field public static final EFFECT_STRAIGHTEN:Ljava/lang/String; = "android.media.effect.effects.StraightenEffect"

.field public static final EFFECT_TEMPERATURE:Ljava/lang/String; = "android.media.effect.effects.ColorTemperatureEffect"

.field public static final EFFECT_TINT:Ljava/lang/String; = "android.media.effect.effects.TintEffect"

.field public static final EFFECT_VIGNETTE:Ljava/lang/String; = "android.media.effect.effects.VignetteEffect"


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

.method public static isEffectSupported(Ljava/lang/String;)Z
    .locals 2
    .param p0, "effectName"    # Ljava/lang/String;

    .prologue
    .line 6
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public createEffect(Ljava/lang/String;)Landroid/media/effect/Effect;
    .locals 2
    .param p1, "effectName"    # Ljava/lang/String;

    .prologue
    .line 5
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
