#!/usr/bin/env bash


# Open ID Connect arguments
dxc_oidc_server="http://127.0.0.1:8088"
dxc_oidc_client_id="dxcengine_api"
dxc_oidc_client_secret=""
dxc_oidc_redirect_uris=["${dxc_oidc_server}/api-auth/cb"]
dxc_oidc_post_logout_redirect_uris=["${dxc_oidc_server}/api-logout"]
dxc_oidc_discover_uri="${dxc_oidc_server}/realms/dxc-stagging"
dxc_oidc_response_type=["code"]

# URI of Reversense marketplace
marketplace_uri="official"



# ===============================
# Config
# ===============================
DXC_USER_SRV="dexcalibur-bin"
DXC_HTTP_PORT=8080
DXC_WS_PORT=8081
DXC_HTTPS_PORT=8443
DXC_HEAP_SZ=4096
DXC_REL_PATH=""
DXC_DB_PORT="27017"
DXC_DB_HOST="127.0.0.1"
DXC_DB_USER="master"
DXC_DB_PWD="master123"
DXC_DB_MODE="DEFAULT"
DEBIAN_FRONTEND=noninteractive
DXC_V_APKTOOL="2.7.0"
DXC_V_BAKSMALI="2.5.2"
DXC_V_BINWALK="3.1.0"
DXC_FRIDA_VERSION="16.1.3"
DXC_BASE_PATH=""
DXC_BUILD_TARGET=""
NODE_MAJOR="18"
DXC_TMP=/tmp
DXC_USER_HOME="/home/$DXC_USER_SRV"
TMP_FOLDER="$DXC_USER_HOME/tmp"
ARTIFACTS_FOLDER="$DXC_USER_HOME/artifacts"
DXC_BIN_FOLDER="$DXC_USER_HOME/tmp"
ANDROID_SDK_ROOT="$DXC_USER_HOME/android"
ANDROID_CMD_VERSION="commandlinetools-linux-10406996_latest.zip"



# ===============================
# Install basic utils
# ===============================

# 'Workspace' volumes hold projects data and some engine configuration and binary
# 'uis' volumes contains UI interfaces, it is the www root folder where each UI are stored into separate folder
# VOLUME [ "$DXC_USER_HOME/workspace", "/uis", "/security" ]




# ===============================
# Setup user
# ===============================

sudo apt-get -qqy install nodejs python3 python3-distutils python3-apt && \
sudo npm install -g npm@10.0.0


# ===============================
# Install RUST
# ===============================

(curl https://sh.rustup.rs -sSf | sh -s -- -y) && \
    export PATH=$HOME/.cargo/bin:$PATH && \
    ls -la $HOME/.cargo/bin

# ===============================
# Install Android SDKManager, and pip
# ===============================

wget https://dl.google.com/android/repository/${ANDROID_CMD_VERSION} -P /tmp && \
    unzip -d $ANDROID_SDK_ROOT /tmp/$ANDROID_CMD_VERSION && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && cd $ANDROID_SDK_ROOT/cmdline-tools && \
    mkdir tools && \
    mv NOTICE.txt source.properties bin lib ./tools/ && \
    cd $ANDROID_SDK_ROOT/cmdline-tools/tools && \
    mkdir $TMP_FOLDER && \
    curl -sSL https://bootstrap.pypa.io/get-pip.py -o $TMP_FOLDER"/get-pip.py" && \
    python3 $TMP_FOLDER/"get-pip.py"

PATH="$PATH:$DXC_USER_HOME/.local/bin:$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/${ANDROID_BUILD_TOOLS_VERSION}"

# RUN yes Y | sdkmanager --licenses
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_BUILD_TOOLS}
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_PLATFORM_VERSION}



# ===============================
# Install Binwalk from source
# ===============================
# BINWALK_INSTALL_DIR="/tmp/binwalk"
# DEFAULT_WORKING_DIR="/analysis"

curl -L -o "$TMP_FOLDER/binwalk.zip" "https://github.com/ReFirmLabs/binwalk/archive/refs/tags/v"$DXC_V_BINWALK".zip" && \
    cd $TMP_FOLDER && \
    unzip binwalk.zip && \
    cd ./binwalk-$DXC_V_BINWALK && \
    mkdir -p $DXC_USER_HOME/.config/pip && \
    echo "[global]" > $DXC_USER_HOME/.config/pip/pip.conf && \
    echo "break-system-packages = true" >> $DXC_USER_HOME/.config/pip/pip.conf && \
    chmod +x ./dependencies/ubuntu.sh && \
    sudo ./dependencies/ubuntu.sh && \
    echo $PATH && \
    $HOME/.cargo/bin/cargo build --release && \
    sudo cp ./target/release/binwalk /usr/local/bin/binwalk && \
    sudo chmod 777 /usr/local/bin/binwalk && \
    mkdir $DXC_USER_HOME/bin && \
    cp ./target/release/binwalk $DXC_USER_HOME/binwalk && \
    sudo chmod +x $DXC_USER_HOME/binwalk && \
    cd $DXC_USER_HOME

# Enable this environment variable to remove extractor top-level symlink,
# as the symlink target path in the docker environment will not match that of the host.
BINWALK_RM_EXTRACTION_SYMLINK=1

# ===============================
# Third-part : apktool, baksmali, binwalk
# ===============================

curl -L -o "$TMP_FOLDER/apktool.jar" "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_"$DXC_V_APKTOOL".jar" && \
    curl -L -o "$TMP_FOLDER/baksmali.jar" "https://bitbucket.org/JesusFreke/smali/downloads/baksmali-"$DXC_V_BAKSMALI".jar"

# ===============================
# Install :
#  - Android Debug Bridge
#  - Radare 2
# ===============================
(yes Y | sdkmanager --verbose --no_https "platform-tools") && \
    cd $TMP_FOLDER && git clone https://github.com/radareorg/radare2 && \
    chmod a+x ./radare2/sys/install.sh && ./radare2/sys/install.sh

# ===============================
# Import frida version from server artifacts
# ===============================

echo "$DXC_FRIDA_VERSION" > "$ARTIFACTS_FOLDER/frida_version"

# ===============================
# Third-part : frida
# ===============================

RUN IMPORTED_FRIDA_VER=`cat "$ARTIFACTS_FOLDER/frida_version"` && pip install frida==$IMPORTED_FRIDA_VER frida-tools

# ===============================
# Install dexcalibur server from artifacts
# ===============================
COPY dxc-server-linux.tar.gz "$ARTIFACTS_FOLDER/dxc-server.tar.gz"

RUN ls -la $ARTIFACTS_FOLDER && \
    sudo chown -R $DXC_USER_SRV:$DXC_USER_SRV $ARTIFACTS_FOLDER && \
    sudo chown $DXC_USER_SRV:$DXC_USER_SRV "$ARTIFACTS_FOLDER/dxc-server.tar.gz" && \
    cd "$ARTIFACTS_FOLDER" && \
    tar xvf "$ARTIFACTS_FOLDER/dxc-server.tar.gz"

# ===============================
# [REMOVED] Install UIs
# ===============================

# RUN rm -r $ARTIFACTS_FOLDER/dist/src/webserver/www/ && ln -s /www_uis  $ARTIFACTS_FOLDER/dist/src/webserver/www

# ===============================
# Configure server
# ===============================

# create files
mkdir $DXC_USER_HOME/.dexcalibur && \
    ln -s /uis  $ARTIFACTS_FOLDER/dist/src/webserver/www && \
     chown -R $DXC_USER_SRV:$DXC_USER_SRV $DXC_USER_HOME/.dexcalibur && \
     node ./dexcalibur-adm.mjs server \
        --create-home=$DXC_USER_HOME/.dexcalibur \
        --db-host=$DXC_DB_HOST \
        --db-port=$DXC_DB_PORT \
        --set-marketplace=$marketplace_uri \
        --set-wsi=$DXC_USER_HOME/.dexcalibur/.dxc \
        --create-ws=$DXC_USER_HOME/workspace \
        --heap-size=$DXC_HEAP_SZ \
        --http-port=$DXC_HTTP_PORT \
        --ws-port=$DXC_WS_PORT && \
    echo "$DXC_DB_USER:$DXC_DB_PWD:admin:$DXC_DB_MODE" > $DXC_USER_HOME/.dexcalibur/db.credentials && \
    node ./dexcalibur-adm.mjs server --db-credential=$DXC_USER_HOME"/.dexcalibur/db.credentials" && \
    cat  $DXC_USER_HOME/.dexcalibur/dxc.json



# configure external tools
RUN ls -la $DXC_USER_HOME/.dexcalibur && \
    ls -la $DXC_USER_HOME/.dexcalibur/.dxc && \
    echo $PATH && \
    chmod 777 -R $DXC_USER_HOME/.dexcalibur/.dxc && \
    mv "$TMP_FOLDER/baksmali.jar" $DXC_USER_HOME/.dexcalibur/.dxc/bin/baksmali.jar && \
    mv "$TMP_FOLDER/apktool.jar" $DXC_USER_HOME/.dexcalibur/.dxc/bin/apktool.jar && \
    node ./dexcalibur-adm.mjs tools --name=java --path=java && \
    node ./dexcalibur-adm.mjs tools --name=python --path=python3 && \
    node ./dexcalibur-adm.mjs tools --name=frida --path=frida && \
    node ./dexcalibur-adm.mjs tools --name=radare2 --path=r2 && \
    node ./dexcalibur-adm.mjs tools --name=adb --path=$ANDROID_SDK_ROOT/platform-tools/adb && \
    node ./dexcalibur-adm.mjs tools --name=binwalk --path=binwalk && \
    node ./dexcalibur-adm.mjs tools --name=shell --path=/bin/sh && \
    node ./dexcalibur-adm.mjs tools --name=baksmali --path=$DXC_USER_HOME/.dexcalibur/.dxc/bin/baksmali.jar && \
    node ./dexcalibur-adm.mjs tools --name=apktool --path=$DXC_USER_HOME/.dexcalibur/.dxc/bin/apktool.jar && \
    node ./dexcalibur-adm.mjs server -l && \
    node ./dexcalibur-adm.mjs tools -l

# check install
echo "[*] Check install"
node ./dexcalibur-adm.mjs tools --check
