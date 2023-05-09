#!/usr/bin/env zsh


if [[ $DXC_BASE_PATH == "" ]]; then
  echo "Usage: ./scripts/prepare_thirdparty.sh"
  echo "======================================="
  echo "Environment variables DXC_BASE_PATH and DXC_BUILD_TARGET (macos,ms,linux,...) are mandatory"
  exit 0
fi

if [[ $DXC_BUILD_TARGET == "" ]]; then
  echo "Usage: ./scripts/prepare_thirdparty.sh"
  echo "======================================="
  echo "Environment variables DXC_BASE_PATH and DXC_BUILD_TARGET (macos,ms,linux,...) are mandatory"
  exit 0
fi

if [[ ! -f $DXC_BASE_PATH/package.json ]]; then
  echo "Usage: ./scripts/prepare_thirdparty.sh"
  echo "======================================="
  echo "Environment variable DXC_BASE_PATH must point to /dexcalibur-ts/ root folder"
  exit 0
fi

thirdpartyPath=$DXC_BASE_PATH/thirdparty

if [[ -d $thirdpartyPath ]]; then
  echo "[*] Delete '"$thirdpartyPath"' directory"
  rm -r $thirdpartyPath
fi


if [[ ! -d $thirdpartyPath ]]; then
  echo "[*] Create '"$thirdpartyPath"' directory"
  mkdir $thirdpartyPath
fi



DXC_V_APKTOOL="2.7.0"
DXC_V_BAKSMALI="2.5.2"

G="\033[0;32m"
NC="\033[0m"
Y="\033[0;33m"
C="\033[0;36m"
R="\033[0;31m"


# ============ ADB ========

if [ "$DXC_BUILD_TARGET" = "macos" ]; then
  androidsdk_target="darwin"
else
  androidsdk_target="$DXC_BUILD_TARGET"
fi

printf "${C} >  Downloading 'adb' prebuilt binaries for '$DXC_BUILD_TARGET'${NC}\n"
printf "${C} >  URL : https://dl.google.com/android/repository/platform-tools-latest-"$androidsdk_target".zip${NC}\n"
curl -L -o $thirdpartyPath"/android-tools.zip" "https://dl.google.com/android/repository/platform-tools-latest-"$androidsdk_target".zip"

if [ -f $thirdpartyPath"/android-tools.zip" ];then
  # Add license
  printf "${G}[SUCCESS] Android platform has been successfully downloaded${NC}\n"
  # unzip -d $PWD"/tmp/android_plt" $PWD"/tmp/android-tools.zip"
else
  printf "${R}[ERROR] Android platform cannot be downloaded${NC}\n"
  exit
fi


# ============ APKTOOL ========

printf "${C} >  Downloading 'apktool' ($DXC_V_APKTOOL) prebuilt binaries for '$DXC_BUILD_TARGET'${NC}\n"

curl -L -o $thirdpartyPath"/apktool.jar" "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_"$DXC_V_APKTOOL".jar"
if [ -f $thirdpartyPath"/apktool.jar" ];then
  # Add license
  printf "${G}[SUCCESS] APKTool has been successfully downloaded${NC}\n"
else
  printf "${R}[ERROR] APKTool cannot be downloaded${NC}\n"
  exit
fi

# ============ BAKSMALI ========

printf "${C} >  Downloading 'baksmali' ($DXC_V_BAKSMALI) prebuilt binaries for '$DXC_BUILD_TARGET'${NC}\n"

curl -L -o $thirdpartyPath"/baksmali.jar" "https://bitbucket.org/JesusFreke/smali/downloads/baksmali-"$DXC_V_BAKSMALI".jar"
if [ -f $thirdpartyPath"/baksmali.jar" ];then
  # Add license
  printf "${G}[SUCCESS] Baksmali has been successfully downloaded${NC}\n"
else
  printf "${R}[ERROR] Baksmali cannot be downloaded${NC}\n"
  exit
fi


# =========== BINWALK =========

printf "${C} >  Downloading 'binwalk' (master) prebuilt binaries for '$DXC_BUILD_TARGET'${NC}\n"

curl -L -o $thirdpartyPath"/binwalk.zip" "https://github.com/ReFirmLabs/binwalk/archive/refs/heads/master.zip"
if [ -f $thirdpartyPath"/binwalk.zip" ];then
  printf "${G}[SUCCESS] Binwalk has been successfully downloaded${NC}\n"
else
  printf "${R}[ERROR] Binwalk cannot be downloaded${NC}\n"
  exit
fi



