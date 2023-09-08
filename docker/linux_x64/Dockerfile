# =================== BUILD STAGE =====================

# =================== FINAL STAGE =====================

FROM openjdk:18-jdk-slim

LABEL maintainer="georges.michel@reversense.com"

# ===============================
# Config
# ===============================
ENV DXC_USER_SRV="dexcalibur-bin"
ENV DXC_USER_DATA="dexcalibur-data"

ENV DEBIAN_FRONTEND=noninteractive
ENV DXC_V_APKTOOL="2.7.0"
ENV DXC_V_BAKSMALI="2.5.2"

ENV DXC_V_R2="2.5.2"
ENV DXC_V_FRIDA="2.5.2"
ENV DXC_V_BINWALK="2.5.2"

ENV DXC_BASE_PATH=""
ENV DXC_BUILD_TARGET=""
ENV NODE_MAJOR="18"

ENV DXC_TMP=/tmp

# ===============================
# Args
# ===============================

ARG user_server=$DXC_USER_SRV
ARG dxc_http_port=8080
ARG dxc_ws_port=8001
ARG dxc_admin="admin"
ARG dxc_pwd="dxcserver"
ARG marketplace_uri="official"

ARG ANDROID_CMD_VERSION="commandlinetools-linux-10406996_latest.zip"

# ===============================
# Install basic utils
# ===============================
WORKDIR /

RUN apt-get update && apt install -y curl ca-certificates gnupg wget unzip  \
    bzip2 libdrm-dev libxkbcommon-dev libgbm-dev libasound-dev libnss3  \
    libxcursor1 libpulse-dev libxshmfence-dev xauth xvfb git x11vnc fluxbox  \
    wmctrl libdbus-glib-1-2 sudo



# ===============================
# Install arm64 node
# ===============================
RUN mkdir -p /etc/apt/keyrings && \
    (curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg)

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list





# ===============================
# Setup user
# ===============================

RUN useradd "$user_server" --create-home --shell /bin/bash && passwd -d "$user_server"

RUN echo "%$user_server ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers



USER $user_server
WORKDIR /home/$user_server

RUN sudo apt-get update && \
    sudo apt-get -qqy install nodejs python3

RUN sudo npm install -g npm@10.0.0

ENV DXC_USER_HOME="/home/$user_server"
ENV TMP_FOLDER="$DXC_USER_HOME/tmp"
ENV ARTIFACTS_FOLDER="$DXC_USER_HOME/artifacts"
ENV DXC_BIN_FOLDER="$DXC_USER_HOME/tmp"
ENV ANDROID_SDK_ROOT="$DXC_USER_HOME/android"

# ===============================
# Install Android SDKManager
# ===============================

RUN wget https://dl.google.com/android/repository/${ANDROID_CMD_VERSION} -P /tmp && \
    unzip -d $ANDROID_SDK_ROOT /tmp/$ANDROID_CMD_VERSION && \
    mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && cd $ANDROID_SDK_ROOT/cmdline-tools && \
    mkdir tools && \
    mv NOTICE.txt source.properties bin lib ./tools/ && \
    cd $ANDROID_SDK_ROOT/cmdline-tools/tools


ENV PATH="$PATH:$DXC_USER_HOME/.local/bin:$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/${ANDROID_BUILD_TOOLS_VERSION}"


# RUN yes Y | sdkmanager --licenses
# RUN yes Y | sdkmanager --verbose --no_https "platform-tools"
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_BUILD_TOOLS}
# RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_PLATFORM_VERSION}


RUN mkdir $TMP_FOLDER


# ===============================
# Install pip
# ===============================

RUN curl -sSL https://bootstrap.pypa.io/get-pip.py -o $TMP_FOLDER"/get-pip.py" && python3 $TMP_FOLDER/"get-pip.py"



# ===============================
# Third-part : r2
# ===============================

RUN sudo apt-get -qqy install make gcc
RUN cd $TMP_FOLDER && git clone https://github.com/radareorg/radare2 && \
    chmod a+x ./radare2/sys/install.sh && ./radare2/sys/install.sh



# ===============================
# Third-part : apktool
# ===============================

RUN curl -L -o "$TMP_FOLDER/apktool.jar" "https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_"$DXC_V_APKTOOL".jar"

# ===============================
# Third-part : baksmali
# ===============================

RUN curl -L -o "$TMP_FOLDER/baksmali.jar" "https://bitbucket.org/JesusFreke/smali/downloads/baksmali-"$DXC_V_BAKSMALI".jar"

# ===============================
# Third-part : binwalk
# ===============================

RUN curl -L -o "$TMP_FOLDER/binwalk.zip" "https://github.com/ReFirmLabs/binwalk/archive/refs/heads/master.zip" && \
    cd  $TMP_FOLDER && unzip -d binwalk binwalk.zip && \
    cd binwalk/binwalk-master

RUN cd $TMP_FOLDER/binwalk/binwalk-master && sudo python3 ./setup.py install

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
    sudo chown -R $user_server:$user_server $ARTIFACTS_FOLDER && \
    sudo chown $user_server:$user_server "$ARTIFACTS_FOLDER/dxc-server.tar.gz"

RUN ls -la  && cd "$ARTIFACTS_FOLDER" && \
     tar xvf "$ARTIFACTS_FOLDER/dxc-server.tar.gz"  && \
     ls -la




# ===============================
# Install Home UI
# ===============================

COPY dxc-home-dist.tar.gz "$ARTIFACTS_FOLDER/dxc-home.tar.gz"

RUN sudo chown $user_server:$user_server "$ARTIFACTS_FOLDER/dxc-home.tar.gz" && \
    mkdir "$ARTIFACTS_FOLDER/dxc-home" && \
    tar xvf "$ARTIFACTS_FOLDER/dxc-home.tar.gz" -C "$ARTIFACTS_FOLDER/dxc-home" && \
    ls

RUN mv "$ARTIFACTS_FOLDER/dxc-home/dist" "$ARTIFACTS_FOLDER/dist/src/webserver/www/home"


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
        --create-ws=$DXC_USER_HOME/workspace \
        --heap-size=4096


# configure external tools
RUN node ./dexcalibur-adm.mjs tools --name=java --path=java && \
    node ./dexcalibur-adm.mjs tools --name=python --path=python3 && \
    node ./dexcalibur-adm.mjs tools --name=frida --path=java && \
    node ./dexcalibur-adm.mjs tools --name=radare2 --path=r2 && \
    node ./dexcalibur-adm.mjs tools --name=adb --path=adb && \
    node ./dexcalibur-adm.mjs tools --name=binwalk --path=binwalk && \
    node ./dexcalibur-adm.mjs tools --name=shell --path=/bin/sh

RUN ls -la $DXC_USER_HOME && \
    ls -la $DXC_USER_HOME/workspace && \
    ls -la $DXC_USER_HOME/workspace/.dxc && \
    ls -la $DXC_USER_HOME/workspace/.dxc/bin


RUN sudo chown -R $user_server:$user_server $DXC_USER_HOME/workspace/.dxc $DXC_USER_HOME/workspace $DXC_USER_HOME/workspace/.dxc/bin


RUN mv "$TMP_FOLDER/baksmali.jar" $DXC_USER_HOME/workspace/.dxc/bin/baksmali.jar && \
    node ./dexcalibur-adm.mjs tools --name=baksmali --path=$DXC_USER_HOME/workspace/.dxc/bin/baksmali.jar

RUN mv "$TMP_FOLDER/apktool.jar" $DXC_USER_HOME/workspace/.dxc/bin/apktool.jar && \
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
# Dexcalibur Web Socket
EXPOSE 8002

RUN cd "$ARTIFACTS_FOLDER/dist" && \
    node ./dexcalibur.js --gui=home


# RUN curl -L -o "$TMP_FOLDER/home-ui.tar.gz" "$DXC_ARTIFACTS https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_"$DXC_V_APKTOOL".jar"

