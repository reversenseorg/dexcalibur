# =================== BUILD STAGE =====================

# =================== FINAL STAGE =====================

FROM arm64v8/amazoncorretto:17.0.8-al2023-headless

LABEL maintainer="georges.michel@reversense.com"

# ===============================
# Runtime args
# ===============================

# Comma seperated value. Supported values (subject to change, not exhaustive) : home , pro, oracle, ...
ENV DXC_PRODUCTS="home,pro"


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

ARG DB_HOST
ARG DB_PORT
ARG DB_URI

# ===============================
# Config
# ===============================
ENV DXC_USER_SRV=${user_server}

ENV DXC_HTTP_PORT=${dxc_http_port}
ENV DXC_WS_PORT=${dxc_ws_port}
ENV DXC_HEAP_SZ=${dxc_heap_size}

ENV DEBIAN_FRONTEND=noninteractive
ENV DXC_V_APKTOOL="2.7.0"
ENV DXC_V_BAKSMALI="2.5.2"

# ENV DXC_V_R2="2.5.2"
# ENV DXC_V_FRIDA="2.5.2"
# ENV DXC_V_BINWALK="2.5.2"

ENV DXC_BASE_PATH=""
ENV DXC_BUILD_TARGET=""
ENV NODE_MAJOR="18"

ENV DXC_TMP=/tmp

ENV DXC_USER_HOME="/home/$DXC_USER_SRV"
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

RUN apt update && apt install -y curl ca-certificates gnupg wget unzip bzip2 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libnss3 libxcursor1 libpulse-dev libxshmfence-dev xauth xvfb git x11vnc fluxbox wmctrl libdbus-glib-1-2

# ===============================
# Install arm64 node
# ===============================
RUN mkdir -p /etc/apt/keyrings && \
    (curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg)

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && \
    apt-get -qqy install nodejs && \
    npm install -g npm@10.0.0 \

# RUN apt-get update && apt install -y curl ca-certificates gnupg wget unzip  \
#    bzip2 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libnss3  \
#     libxcursor1 libpulse-dev libxshmfence-dev xauth xvfb git x11vnc fluxbox  \
#    wmctrl libdbus-glib-1-2 sudo make gcc


# ===============================
# Setup user
# ===============================

RUN useradd "$DXC_USER_SRV" --create-home --shell /bin/bash && passwd -d "$DXC_USER_SRV"

RUN echo "%$DXC_USER_SRV ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER $DXC_USER_SRV
WORKDIR /home/$DXC_USER_SRV

RUN sudo apt-get update && \
    sudo apt-get -qqy install nodejs python3 && \
    sudo npm install -g npm@10.0.0


# ===============================
# Install Android SDKManager, and pip
# ===============================

RUN wget https://dl.google.com/android/repository/${ANDROID_CMD_VERSION} -P /tmp && \
    unzip -d $ANDROID_SDK_ROOT /tmp/$ANDROID_CMD_VERSION && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && cd $ANDROID_SDK_ROOT/cmdline-tools && \
    mkdir tools && \
    mv NOTICE.txt source.properties bin lib ./tools/ && \
    cd $ANDROID_SDK_ROOT/cmdline-tools/tools && \
    mkdir $TMP_FOLDER && \
    curl -sSL https://bootstrap.pypa.io/get-pip.py -o $TMP_FOLDER"/get-pip.py" && \
    python3 $TMP_FOLDER/"get-pip.py"

ENV PATH="$PATH:$DXC_USER_HOME/.local/bin:$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/${ANDROID_BUILD_TOOLS_VERSION}"

# RUN yes Y | sdkmanager --licenses
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_BUILD_TOOLS}
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_PLATFORM_VERSION}

# ===============================
# Install :
#  - Android Debug Bridge
#  - Radare 2
# ===============================
RUN yes Y | sdkmanager --verbose --no_https "platform-tools" && \
    cd $TMP_FOLDER && git clone https://github.com/radareorg/radare2 && \
    chmod a+x ./radare2/sys/install.sh && ./radare2/sys/install.sh

# ===============================
# Third-part : apktool, baksmali, binwalk
# ===============================

RUN curl -L -o "$TMP_FOLDER/apktool.jar" "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_"$DXC_V_APKTOOL".jar" && \
    curl -L -o "$TMP_FOLDER/baksmali.jar" "https://bitbucket.org/JesusFreke/smali/downloads/baksmali-"$DXC_V_BAKSMALI".jar" && \
    curl -L -o "$TMP_FOLDER/binwalk.zip" "https://github.com/ReFirmLabs/binwalk/archive/refs/heads/master.zip" && \
    cd  $TMP_FOLDER && unzip -d binwalk binwalk.zip && \
    cd $TMP_FOLDER/binwalk/binwalk-master && \
    sudo python3 ./setup.py install


# ===============================
# Import frida version from server artifacts
# ===============================

COPY frida_version "$ARTIFACTS_FOLDER/frida_version"

# ===============================
# Third-part : frida
# ===============================

RUN IMPORTED_FRIDA_VER=`cat "$ARTIFACTS_FOLDER/frida_version"` && pip install frida==$IMPORTED_FRIDA_VER

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
# Configure server
# ===============================

WORKDIR "$ARTIFACTS_FOLDER/dist"

# create files
RUN mkdir $DXC_USER_HOME/.dexcalibur && \
    ln -s /uis  $ARTIFACTS_FOLDER/dist/src/webserver/www && \
     chown -R $DXC_USER_SRV:$DXC_USER_SRV $DXC_USER_HOME/.dexcalibur&& \
     node ./dexcalibur-adm.mjs server \
        --create-home=$DXC_USER_HOME/.dexcalibur \
        --set-marketplace=$marketplace_uri \
        --set-wsi=$DXC_USER_HOME/.dexcalibur/.dxc \
        --create-ws=$DXC_USER_HOME/workspace \
        --heap-size=$DXC_HEAP_SZ \
        --http-port=$DXC_HTTP_PORT \
        --ws-port=$DXC_WS_PORT

# configure external tools
RUN ls -la $DXC_USER_HOME/.dexcalibur && \
    ls -la $DXC_USER_HOME/.dexcalibur/.dxc && \
    echo $USER && \
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


# configure authentication
RUN cat $DXC_USER_HOME/.dexcalibur/dxc.json

# Dexcalibur HTTP & WebSocket
EXPOSE ${DXC_HTTP_PORT} ${DXC_WS_PORT}

# Dexcalibur HTTPS
EXPOSE 8443

CMD [ "node", "./dexcalibur.js", "--gui=$DXC_PRODUCTS" ]

# ENTRYPOINT [ "/bin/sh", "start.sh" ]