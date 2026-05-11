# =================== BUILD STAGE =====================

# =================== FINAL STAGE =====================

FROM openjdk:18-jdk-slim

LABEL maintainer="georges.michel@reversense.com"




# ===============================
# Args
# ===============================

ARG user_server="dexcalibur-bin"

ARG dxc_http_port=8080
ARG dxc_ws_port=8001
ARG dxc_heap_size=4096

# Obsolete. Standlone auth have been replaced by SSO
# ARG dxc_admin="admin"
# ARG dxc_pwd="dxcserver"

# URI of Reversense marketplace
ARG marketplace_uri="official"

ARG ANDROID_CMD_VERSION="commandlinetools-linux-10406996_latest.zip"

ARG NODE_HEAP_SIZE

ARG dxc_db_host="127.0.0.1"
ARG dxc_db_port="27017"
ARG dxc_db_user="master"
ARG dxc_db_passwd="master123"
ARG dxc_db_mode="DEFAULT"

# Comma seperated value. Supported values (subject to change, not exhaustive) : home , pro, oracle, ...
ARG dxc_uis="home,pro"

ARG dxc_http_port=8080
ARG dxc_ws_port=8081
ARG dxc_https_port=8443

# ===============================
# Config
# ===============================
ENV DXC_USER_SRV=${user_server}

ENV DXC_HTTP_PORT=${dxc_http_port}
ENV DXC_WS_PORT=${dxc_ws_port}
ENV DXC_HEAP_SZ=${dxc_heap_size}
ENV DXC_REL_PATH=""

ENV DXC_NODE_HEAP_SZ=4096

ENV DXC_DB_PORT=${dxc_db_port}
ENV DXC_DB_HOST=${dxc_db_host}
ENV DXC_DB_USER=${dxc_db_user}
ENV DXC_DB_PWD=${dxc_db_pwd}
ENV DXC_DB_MODE=${dxc_db_mode}


ENV DEBIAN_FRONTEND=noninteractive
ENV DXC_V_APKTOOL="2.12.0"
ENV DXC_V_BAKSMALI="2.5.2"
ENV DXC_V_BINWALK="3.1.0"
ENV DXC_V_APKEEP="0.17.0"

# ENV DXC_V_R2="2.5.2"
# ENV DXC_V_FRIDA="2.5.2"
# ENV DXC_V_BINWALK="2.5.2"

ENV DXC_BASE_PATH=""
ENV DXC_BUILD_TARGET=""
ENV NODE_MAJOR="18"

ENV DXC_TMP=/tmp

ENV DXC_USER_HOME="/home/$DXC_USER_SRV"
ENV DXC_HTTPS_PORT=${dxc_https_port}


ENV DXC_USER_HOME="/home/$user_server"
ENV TMP_FOLDER="$DXC_USER_HOME/tmp"
ENV ARTIFACTS_FOLDER="$DXC_USER_HOME/artifacts"
ENV DXC_BIN_FOLDER="$DXC_USER_HOME/tmp"
ENV ANDROID_SDK_ROOT="$DXC_USER_HOME/android"




# ===============================
# Install basic utils
# ===============================

# 'Workspace' volumes hold projects data and some engine configuration and binary
# 'uis' volumes contains UI interfaces, it is the www root folder where each UI are stored into separate folder
VOLUME [ "$DXC_USER_HOME/workspace", "/uis", "/security" ]


# ===============================
# Install basic utils
# ===============================
WORKDIR /

RUN apt-get update && apt install -y --fix-missing pkg-config libssl-dev curl ca-certificates gnupg wget unzip  \
    bzip2 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libnss3 && \
    apt install -y --fix-missing libxcursor1 libpulse-dev libxshmfence-dev xauth xvfb git x11vnc fluxbox  \
    wmctrl libdbus-glib-1-2


RUN apt install -y --fix-missing sudo make gcc build-essential xz-utils \
        sudo libfontconfig1-dev libfreetype6-dev && \
    mkdir -p /etc/apt/keyrings && \
    (curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg) && \
    (echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list) && \
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
        && chmod +x kubectl \
        && mv kubectl /usr/local/bin/


# ===============================
# Setup user
# ===============================

RUN useradd "$DXC_USER_SRV" --create-home --shell /bin/bash && passwd -d "$DXC_USER_SRV"

RUN echo "%$DXC_USER_SRV ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER $DXC_USER_SRV
WORKDIR /home/$DXC_USER_SRV

RUN sudo apt-get update && \
    sudo apt-get -qqy install nodejs python3 python3-distutils python3-apt

RUN sudo npm install -g npm@10.0.0

RUN  (curl https://sh.rustup.rs -sSf | sh -s -- -y) && \
    export PATH=$HOME/.cargo/bin:$PATH && \
    ls -la $HOME/.cargo/bin

# ===============================
# Install Android SDKManager, and pip
# ===============================

RUN wget -q https://dl.google.com/android/repository/${ANDROID_CMD_VERSION} -P /tmp && \
    unzip -d $ANDROID_SDK_ROOT /tmp/$ANDROID_CMD_VERSION && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && cd $ANDROID_SDK_ROOT/cmdline-tools && \
    mkdir tools && \
    mv NOTICE.txt source.properties bin lib ./tools/ && \
    cd $ANDROID_SDK_ROOT/cmdline-tools/tools && \
    mkdir $TMP_FOLDER && \
    curl -sSL https://bootstrap.pypa.io/pip/3.9/get-pip.py -o $TMP_FOLDER"/get-pip.py" && \
    python3 $TMP_FOLDER/"get-pip.py" && \
    rm -f /tmp/$ANDROID_CMD_VERSION

# curl -sSL https://bootstrap.pypa.io/get-pip.py -o $TMP_FOLDER"/get-pip.py" && \

ENV PATH="$PATH:$DXC_USER_HOME/.local/bin:$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/${ANDROID_BUILD_TOOLS_VERSION}"

# RUN yes Y | sdkmanager --licenses
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_BUILD_TOOLS}
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_PLATFORM_VERSION}


# ===============================
# Install Apkeep from source
# ===============================

RUN curl -L -o "$TMP_FOLDER/apkeep.zip" "https://github.com/EFForg/apkeep/archive/refs/tags/"$DXC_V_APKEEP".zip" && \
    cd $TMP_FOLDER && \
    unzip apkeep.zip && \
    cd ./apkeep-$DXC_V_APKEEP && \
    $HOME/.cargo/bin/cargo build --release && \
    sudo cp ./target/release/apkeep /usr/local/bin/apkeep && \
    sudo chmod 777 /usr/local/bin/apkeep && \
    mkdir $DXC_USER_HOME/bin && \
    cp ./target/release/apkeep $DXC_USER_HOME/apkeep && \
    sudo chmod +x $DXC_USER_HOME/apkeep && \
    cd $DXC_USER_HOME && \
    rm -rf ./apkeep-$DXC_V_APKEEP


# ===============================
# Install Binwalk from source
# ===============================
ARG BINWALK_INSTALL_DIR="/tmp/binwalk"
ARG DEFAULT_WORKING_DIR="/analysis"

RUN curl -L -o "$TMP_FOLDER/binwalk.zip" "https://github.com/ReFirmLabs/binwalk/archive/refs/tags/v"$DXC_V_BINWALK".zip" && \
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
    cp ./target/release/binwalk $DXC_USER_HOME/binwalk && \
    sudo chmod +x $DXC_USER_HOME/binwalk && \
    cd $DXC_USER_HOME && \
    rm -rf ./binwalk-$DXC_V_BINWALK

# Enable this environment variable to remove extractor top-level symlink,
# as the symlink target path in the docker environment will not match that of the host.
ENV BINWALK_RM_EXTRACTION_SYMLINK=1

# ===============================
# Third-part : apktool, baksmali, binwalk
# ===============================

RUN curl -L -o "$TMP_FOLDER/apktool.jar" "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_"$DXC_V_APKTOOL".jar" && \
    curl -L -o "$TMP_FOLDER/baksmali.jar" "https://bitbucket.org/JesusFreke/smali/downloads/baksmali-"$DXC_V_BAKSMALI".jar"

# ===============================
# Install :
#  - Android Debug Bridge
#  - Radare 2
# ===============================
RUN yes Y | sdkmanager --verbose --no_https "platform-tools" && \
    cd $TMP_FOLDER && git clone https://github.com/radareorg/radare2 && \
    chmod a+x ./radare2/sys/install.sh && ./radare2/sys/install.sh && \
    rm -rf ./radare2




# ===============================
# Import frida version from server artifacts
# ===============================

COPY frida_version "$ARTIFACTS_FOLDER/frida_version"

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

WORKDIR "$ARTIFACTS_FOLDER/dist"

# create files
RUN mkdir $DXC_USER_HOME/.dexcalibur && \
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
RUN node ./dexcalibur-adm.mjs tools --check

# Dexcalibur HTTP & WebSocket
EXPOSE ${DXC_HTTP_PORT} ${DXC_WS_PORT}

# Dexcalibur HTTPS
EXPOSE 8443

ENTRYPOINT [ "node", "./dexcalibur.js" ]