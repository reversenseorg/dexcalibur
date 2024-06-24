FROM arm64v8/amazoncorretto:17.0.8-al2023-headless

LABEL maintainer="georges.michel@reversense.com"

# ===============================
# Runtime args
# ===============================

# Comma seperated value. Supported values (subject to change, not exhaustive) : home , pro, oracle, ...
ENV DXC_PRODUCTS="home,pro"


# ===============================
# Config
# ===============================
ENV DEBIAN_FRONTEND=noninteractive
ENV DXC_V_APKTOOL="2.7.0"
ENV DXC_V_BAKSMALI="2.5.2"

ENV DXC_V_R2="2.5.2"
ENV DXC_V_FRIDA="2.5.2"
ENV DXC_V_BINWALK="2.5.2"

ENV DXC_BASE_PATH=""
ENV DXC_BUILD_TARGET=""
ENV NODE_MAJOR="18"

ENV ANDROID_SDK_ROOT=/opt/android
ARG ANDROID_CMD_VERSION="commandlinetools-linux-10406996_latest.zip"
ENV PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/${ANDROID_BUILD_TOOLS_VERSION}"

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
    npm install -g npm@10.0.0

# ===============================
# Install Android SDKManager
# ===============================

RUN wget https://dl.google.com/android/repository/${ANDROID_CMD_VERSION} -P /tmp && \
    unzip -d $ANDROID_SDK_ROOT /tmp/$ANDROID_CMD_VERSION && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && cd $ANDROID_SDK_ROOT/cmdline-tools && \
    mkdir tools && \
    mv NOTICE.txt source.properties bin lib ./tools/ && \
    cd $ANDROID_SDK_ROOT/cmdline-tools/tools


RUN yes Y | sdkmanager --licenses && \
     yes Y | sdkmanager --verbose --no_https "platform-tools" && \
     yes Y | sdkmanager --verbose --no_https ${ANDROID_BUILD_TOOLS} && \
     yes Y | sdkmanager --verbose --no_https ${ANDROID_PLATFORM_VERSION}

# ===============================
# Check Python version
# ===============================

RUN python -v


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
# Install UIs
# ===============================

RUN rm -r $ARTIFACTS_FOLDER/dist/src/webserver/www/ && ln -s /www_uis  $ARTIFACTS_FOLDER/dist/src/webserver/www

# ===============================
# Configure server
# ===============================

WORKDIR "$ARTIFACTS_FOLDER/dist"

# create files
RUN sudo mkdir $DXC_USER_HOME/.dexcalibur $DXC_USER_HOME/workspace && \
     sudo chown $user_server:$user_server $DXC_USER_HOME/.dexcalibur&& \
     sudo node ./dexcalibur-adm.mjs server \
        --create-home=$DXC_USER_HOME/.dexcalibur \
        --set-marketplace=$marketplace_uri \
        --create-ws=/workspace \
        --heap-size=4096 \
        --http-port=${dxc_http_port} \
        --ws-port=${dxc_ws_port}


# configure external tools
RUN node ./dexcalibur-adm.mjs tools --name=java --path=java && \
    node ./dexcalibur-adm.mjs tools --name=python --path=python3 && \
    node ./dexcalibur-adm.mjs tools --name=frida --path=frida && \
    node ./dexcalibur-adm.mjs tools --name=radare2 --path=r2 && \
    node ./dexcalibur-adm.mjs tools --name=adb --path=$ANDROID_SDK_ROOT/platform-tools/adb && \
    node ./dexcalibur-adm.mjs tools --name=binwalk --path=binwalk && \
    node ./dexcalibur-adm.mjs tools --name=shell --path=/bin/sh



RUN sudo chown -R $user_server:$user_server $DXC_USER_HOME/workspace/.dxc $DXC_USER_HOME/workspace $DXC_USER_HOME/workspace/.dxc/bin && \
    mv "$TMP_FOLDER/baksmali.jar" $DXC_USER_HOME/workspace/.dxc/bin/baksmali.jar && \
    node ./dexcalibur-adm.mjs tools --name=baksmali --path=$DXC_USER_HOME/workspace/.dxc/bin/baksmali.jar && \
    mv "$TMP_FOLDER/apktool.jar" $DXC_USER_HOME/workspace/.dxc/bin/apktool.jar && \
    node ./dexcalibur-adm.mjs tools --name=apktool --path=$DXC_USER_HOME/workspace/.dxc/bin/apktool.jar

# create users & authentication
RUN node ./dexcalibur-adm.mjs user --add-account=admin && \
    node ./dexcalibur-adm.mjs user -l

RUN cat $DXC_USER_HOME/.dexcalibur/dxc.json

# configure authentication



# ===============================
# Dump config
# ===============================

RUN  node ./dexcalibur-adm.mjs server -l && \
     node ./dexcalibur-adm.mjs tools -l \

# Dexcalibur HTTP
EXPOSE 8080

# Dexcalibur HTTPS
EXPOSE 8443

# Dexcalibur Web Socket
EXPOSE 8002

CMD [ "node", "./dist/dexcalibur.js", "--gui=$DXC_PRODUCTS" ]