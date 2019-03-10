.class public abstract Landroid/hardware/camera2/CameraMetadata;
.super Ljava/lang/Object;
.source "CameraMetadata.java"


# annotations
.annotation system Ldalvik/annotation/Signature;
    value = {
        "<TKey:",
        "Ljava/lang/Object;",
        ">",
        "Ljava/lang/Object;"
    }
.end annotation


# static fields
.field public static final COLOR_CORRECTION_ABERRATION_MODE_FAST:I = 0x1

.field public static final COLOR_CORRECTION_ABERRATION_MODE_HIGH_QUALITY:I = 0x2

.field public static final COLOR_CORRECTION_ABERRATION_MODE_OFF:I = 0x0

.field public static final COLOR_CORRECTION_MODE_FAST:I = 0x1

.field public static final COLOR_CORRECTION_MODE_HIGH_QUALITY:I = 0x2

.field public static final COLOR_CORRECTION_MODE_TRANSFORM_MATRIX:I = 0x0

.field public static final CONTROL_AE_ANTIBANDING_MODE_50HZ:I = 0x1

.field public static final CONTROL_AE_ANTIBANDING_MODE_60HZ:I = 0x2

.field public static final CONTROL_AE_ANTIBANDING_MODE_AUTO:I = 0x3

.field public static final CONTROL_AE_ANTIBANDING_MODE_OFF:I = 0x0

.field public static final CONTROL_AE_MODE_OFF:I = 0x0

.field public static final CONTROL_AE_MODE_ON:I = 0x1

.field public static final CONTROL_AE_MODE_ON_ALWAYS_FLASH:I = 0x3

.field public static final CONTROL_AE_MODE_ON_AUTO_FLASH:I = 0x2

.field public static final CONTROL_AE_MODE_ON_AUTO_FLASH_REDEYE:I = 0x4

.field public static final CONTROL_AE_PRECAPTURE_TRIGGER_IDLE:I = 0x0

.field public static final CONTROL_AE_PRECAPTURE_TRIGGER_START:I = 0x1

.field public static final CONTROL_AE_STATE_CONVERGED:I = 0x2

.field public static final CONTROL_AE_STATE_FLASH_REQUIRED:I = 0x4

.field public static final CONTROL_AE_STATE_INACTIVE:I = 0x0

.field public static final CONTROL_AE_STATE_LOCKED:I = 0x3

.field public static final CONTROL_AE_STATE_PRECAPTURE:I = 0x5

.field public static final CONTROL_AE_STATE_SEARCHING:I = 0x1

.field public static final CONTROL_AF_MODE_AUTO:I = 0x1

.field public static final CONTROL_AF_MODE_CONTINUOUS_PICTURE:I = 0x4

.field public static final CONTROL_AF_MODE_CONTINUOUS_VIDEO:I = 0x3

.field public static final CONTROL_AF_MODE_EDOF:I = 0x5

.field public static final CONTROL_AF_MODE_MACRO:I = 0x2

.field public static final CONTROL_AF_MODE_OFF:I = 0x0

.field public static final CONTROL_AF_STATE_ACTIVE_SCAN:I = 0x3

.field public static final CONTROL_AF_STATE_FOCUSED_LOCKED:I = 0x4

.field public static final CONTROL_AF_STATE_INACTIVE:I = 0x0

.field public static final CONTROL_AF_STATE_NOT_FOCUSED_LOCKED:I = 0x5

.field public static final CONTROL_AF_STATE_PASSIVE_FOCUSED:I = 0x2

.field public static final CONTROL_AF_STATE_PASSIVE_SCAN:I = 0x1

.field public static final CONTROL_AF_STATE_PASSIVE_UNFOCUSED:I = 0x6

.field public static final CONTROL_AF_TRIGGER_CANCEL:I = 0x2

.field public static final CONTROL_AF_TRIGGER_IDLE:I = 0x0

.field public static final CONTROL_AF_TRIGGER_START:I = 0x1

.field public static final CONTROL_AWB_MODE_AUTO:I = 0x1

.field public static final CONTROL_AWB_MODE_CLOUDY_DAYLIGHT:I = 0x6

.field public static final CONTROL_AWB_MODE_DAYLIGHT:I = 0x5

.field public static final CONTROL_AWB_MODE_FLUORESCENT:I = 0x3

.field public static final CONTROL_AWB_MODE_INCANDESCENT:I = 0x2

.field public static final CONTROL_AWB_MODE_OFF:I = 0x0

.field public static final CONTROL_AWB_MODE_SHADE:I = 0x8

.field public static final CONTROL_AWB_MODE_TWILIGHT:I = 0x7

.field public static final CONTROL_AWB_MODE_WARM_FLUORESCENT:I = 0x4

.field public static final CONTROL_AWB_STATE_CONVERGED:I = 0x2

.field public static final CONTROL_AWB_STATE_INACTIVE:I = 0x0

.field public static final CONTROL_AWB_STATE_LOCKED:I = 0x3

.field public static final CONTROL_AWB_STATE_SEARCHING:I = 0x1

.field public static final CONTROL_CAPTURE_INTENT_CUSTOM:I = 0x0

.field public static final CONTROL_CAPTURE_INTENT_MANUAL:I = 0x6

.field public static final CONTROL_CAPTURE_INTENT_PREVIEW:I = 0x1

.field public static final CONTROL_CAPTURE_INTENT_STILL_CAPTURE:I = 0x2

.field public static final CONTROL_CAPTURE_INTENT_VIDEO_RECORD:I = 0x3

.field public static final CONTROL_CAPTURE_INTENT_VIDEO_SNAPSHOT:I = 0x4

.field public static final CONTROL_CAPTURE_INTENT_ZERO_SHUTTER_LAG:I = 0x5

.field public static final CONTROL_EFFECT_MODE_AQUA:I = 0x8

.field public static final CONTROL_EFFECT_MODE_BLACKBOARD:I = 0x7

.field public static final CONTROL_EFFECT_MODE_MONO:I = 0x1

.field public static final CONTROL_EFFECT_MODE_NEGATIVE:I = 0x2

.field public static final CONTROL_EFFECT_MODE_OFF:I = 0x0

.field public static final CONTROL_EFFECT_MODE_POSTERIZE:I = 0x5

.field public static final CONTROL_EFFECT_MODE_SEPIA:I = 0x4

.field public static final CONTROL_EFFECT_MODE_SOLARIZE:I = 0x3

.field public static final CONTROL_EFFECT_MODE_WHITEBOARD:I = 0x6

.field public static final CONTROL_MODE_AUTO:I = 0x1

.field public static final CONTROL_MODE_OFF:I = 0x0

.field public static final CONTROL_MODE_OFF_KEEP_STATE:I = 0x3

.field public static final CONTROL_MODE_USE_SCENE_MODE:I = 0x2

.field public static final CONTROL_SCENE_MODE_ACTION:I = 0x2

.field public static final CONTROL_SCENE_MODE_BARCODE:I = 0x10

.field public static final CONTROL_SCENE_MODE_BEACH:I = 0x8

.field public static final CONTROL_SCENE_MODE_CANDLELIGHT:I = 0xf

.field public static final CONTROL_SCENE_MODE_DISABLED:I = 0x0

.field public static final CONTROL_SCENE_MODE_FACE_PRIORITY:I = 0x1

.field public static final CONTROL_SCENE_MODE_FIREWORKS:I = 0xc

.field public static final CONTROL_SCENE_MODE_HDR:I = 0x12

.field public static final CONTROL_SCENE_MODE_HIGH_SPEED_VIDEO:I = 0x11

.field public static final CONTROL_SCENE_MODE_LANDSCAPE:I = 0x4

.field public static final CONTROL_SCENE_MODE_NIGHT:I = 0x5

.field public static final CONTROL_SCENE_MODE_NIGHT_PORTRAIT:I = 0x6

.field public static final CONTROL_SCENE_MODE_PARTY:I = 0xe

.field public static final CONTROL_SCENE_MODE_PORTRAIT:I = 0x3

.field public static final CONTROL_SCENE_MODE_SNOW:I = 0x9

.field public static final CONTROL_SCENE_MODE_SPORTS:I = 0xd

.field public static final CONTROL_SCENE_MODE_STEADYPHOTO:I = 0xb

.field public static final CONTROL_SCENE_MODE_SUNSET:I = 0xa

.field public static final CONTROL_SCENE_MODE_THEATRE:I = 0x7

.field public static final CONTROL_VIDEO_STABILIZATION_MODE_OFF:I = 0x0

.field public static final CONTROL_VIDEO_STABILIZATION_MODE_ON:I = 0x1

.field public static final EDGE_MODE_FAST:I = 0x1

.field public static final EDGE_MODE_HIGH_QUALITY:I = 0x2

.field public static final EDGE_MODE_OFF:I = 0x0

.field public static final FLASH_MODE_OFF:I = 0x0

.field public static final FLASH_MODE_SINGLE:I = 0x1

.field public static final FLASH_MODE_TORCH:I = 0x2

.field public static final FLASH_STATE_CHARGING:I = 0x1

.field public static final FLASH_STATE_FIRED:I = 0x3

.field public static final FLASH_STATE_PARTIAL:I = 0x4

.field public static final FLASH_STATE_READY:I = 0x2

.field public static final FLASH_STATE_UNAVAILABLE:I = 0x0

.field public static final HOT_PIXEL_MODE_FAST:I = 0x1

.field public static final HOT_PIXEL_MODE_HIGH_QUALITY:I = 0x2

.field public static final HOT_PIXEL_MODE_OFF:I = 0x0

.field public static final INFO_SUPPORTED_HARDWARE_LEVEL_FULL:I = 0x1

.field public static final INFO_SUPPORTED_HARDWARE_LEVEL_LEGACY:I = 0x2

.field public static final INFO_SUPPORTED_HARDWARE_LEVEL_LIMITED:I = 0x0

.field public static final LENS_FACING_BACK:I = 0x1

.field public static final LENS_FACING_FRONT:I = 0x0

.field public static final LENS_INFO_FOCUS_DISTANCE_CALIBRATION_APPROXIMATE:I = 0x1

.field public static final LENS_INFO_FOCUS_DISTANCE_CALIBRATION_CALIBRATED:I = 0x2

.field public static final LENS_INFO_FOCUS_DISTANCE_CALIBRATION_UNCALIBRATED:I = 0x0

.field public static final LENS_OPTICAL_STABILIZATION_MODE_OFF:I = 0x0

.field public static final LENS_OPTICAL_STABILIZATION_MODE_ON:I = 0x1

.field public static final LENS_STATE_MOVING:I = 0x1

.field public static final LENS_STATE_STATIONARY:I = 0x0

.field public static final NOISE_REDUCTION_MODE_FAST:I = 0x1

.field public static final NOISE_REDUCTION_MODE_HIGH_QUALITY:I = 0x2

.field public static final NOISE_REDUCTION_MODE_OFF:I = 0x0

.field public static final REQUEST_AVAILABLE_CAPABILITIES_BACKWARD_COMPATIBLE:I = 0x0

.field public static final REQUEST_AVAILABLE_CAPABILITIES_BURST_CAPTURE:I = 0x6

.field public static final REQUEST_AVAILABLE_CAPABILITIES_MANUAL_POST_PROCESSING:I = 0x2

.field public static final REQUEST_AVAILABLE_CAPABILITIES_MANUAL_SENSOR:I = 0x1

.field public static final REQUEST_AVAILABLE_CAPABILITIES_RAW:I = 0x3

.field public static final REQUEST_AVAILABLE_CAPABILITIES_READ_SENSOR_SETTINGS:I = 0x5

.field public static final SCALER_CROPPING_TYPE_CENTER_ONLY:I = 0x0

.field public static final SCALER_CROPPING_TYPE_FREEFORM:I = 0x1

.field public static final SENSOR_INFO_COLOR_FILTER_ARRANGEMENT_BGGR:I = 0x3

.field public static final SENSOR_INFO_COLOR_FILTER_ARRANGEMENT_GBRG:I = 0x2

.field public static final SENSOR_INFO_COLOR_FILTER_ARRANGEMENT_GRBG:I = 0x1

.field public static final SENSOR_INFO_COLOR_FILTER_ARRANGEMENT_RGB:I = 0x4

.field public static final SENSOR_INFO_COLOR_FILTER_ARRANGEMENT_RGGB:I = 0x0

.field public static final SENSOR_INFO_TIMESTAMP_SOURCE_REALTIME:I = 0x1

.field public static final SENSOR_INFO_TIMESTAMP_SOURCE_UNKNOWN:I = 0x0

.field public static final SENSOR_REFERENCE_ILLUMINANT1_CLOUDY_WEATHER:I = 0xa

.field public static final SENSOR_REFERENCE_ILLUMINANT1_COOL_WHITE_FLUORESCENT:I = 0xe

.field public static final SENSOR_REFERENCE_ILLUMINANT1_D50:I = 0x17

.field public static final SENSOR_REFERENCE_ILLUMINANT1_D55:I = 0x14

.field public static final SENSOR_REFERENCE_ILLUMINANT1_D65:I = 0x15

.field public static final SENSOR_REFERENCE_ILLUMINANT1_D75:I = 0x16

.field public static final SENSOR_REFERENCE_ILLUMINANT1_DAYLIGHT:I = 0x1

.field public static final SENSOR_REFERENCE_ILLUMINANT1_DAYLIGHT_FLUORESCENT:I = 0xc

.field public static final SENSOR_REFERENCE_ILLUMINANT1_DAY_WHITE_FLUORESCENT:I = 0xd

.field public static final SENSOR_REFERENCE_ILLUMINANT1_FINE_WEATHER:I = 0x9

.field public static final SENSOR_REFERENCE_ILLUMINANT1_FLASH:I = 0x4

.field public static final SENSOR_REFERENCE_ILLUMINANT1_FLUORESCENT:I = 0x2

.field public static final SENSOR_REFERENCE_ILLUMINANT1_ISO_STUDIO_TUNGSTEN:I = 0x18

.field public static final SENSOR_REFERENCE_ILLUMINANT1_SHADE:I = 0xb

.field public static final SENSOR_REFERENCE_ILLUMINANT1_STANDARD_A:I = 0x11

.field public static final SENSOR_REFERENCE_ILLUMINANT1_STANDARD_B:I = 0x12

.field public static final SENSOR_REFERENCE_ILLUMINANT1_STANDARD_C:I = 0x13

.field public static final SENSOR_REFERENCE_ILLUMINANT1_TUNGSTEN:I = 0x3

.field public static final SENSOR_REFERENCE_ILLUMINANT1_WHITE_FLUORESCENT:I = 0xf

.field public static final SENSOR_TEST_PATTERN_MODE_COLOR_BARS:I = 0x2

.field public static final SENSOR_TEST_PATTERN_MODE_COLOR_BARS_FADE_TO_GRAY:I = 0x3

.field public static final SENSOR_TEST_PATTERN_MODE_CUSTOM1:I = 0x100

.field public static final SENSOR_TEST_PATTERN_MODE_OFF:I = 0x0

.field public static final SENSOR_TEST_PATTERN_MODE_PN9:I = 0x4

.field public static final SENSOR_TEST_PATTERN_MODE_SOLID_COLOR:I = 0x1

.field public static final SHADING_MODE_FAST:I = 0x1

.field public static final SHADING_MODE_HIGH_QUALITY:I = 0x2

.field public static final SHADING_MODE_OFF:I = 0x0

.field public static final STATISTICS_FACE_DETECT_MODE_FULL:I = 0x2

.field public static final STATISTICS_FACE_DETECT_MODE_OFF:I = 0x0

.field public static final STATISTICS_FACE_DETECT_MODE_SIMPLE:I = 0x1

.field public static final STATISTICS_LENS_SHADING_MAP_MODE_OFF:I = 0x0

.field public static final STATISTICS_LENS_SHADING_MAP_MODE_ON:I = 0x1

.field public static final STATISTICS_SCENE_FLICKER_50HZ:I = 0x1

.field public static final STATISTICS_SCENE_FLICKER_60HZ:I = 0x2

.field public static final STATISTICS_SCENE_FLICKER_NONE:I = 0x0

.field public static final SYNC_MAX_LATENCY_PER_FRAME_CONTROL:I = 0x0

.field public static final SYNC_MAX_LATENCY_UNKNOWN:I = -0x1

.field public static final TONEMAP_MODE_CONTRAST_CURVE:I = 0x0

.field public static final TONEMAP_MODE_FAST:I = 0x1

.field public static final TONEMAP_MODE_HIGH_QUALITY:I = 0x2


# direct methods
.method constructor <init>()V
    .locals 2

    .prologue
    .line 4
    .local p0, "this":Landroid/hardware/camera2/CameraMetadata;, "Landroid/hardware/camera2/CameraMetadata<TTKey;>;"
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method


# virtual methods
.method public getKeys()Ljava/util/List;
    .locals 2
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "()",
            "Ljava/util/List",
            "<TTKey;>;"
        }
    .end annotation

    .prologue
    .line 6
    .local p0, "this":Landroid/hardware/camera2/CameraMetadata;, "Landroid/hardware/camera2/CameraMetadata<TTKey;>;"
    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "Stub!"

    invoke-direct {v0, v1}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;)V

    throw v0
.end method
