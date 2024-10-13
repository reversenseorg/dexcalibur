FROM arm64v8/amazoncorretto:17.0.8-al2023-headless

LABEL maintainer="georges.michel@reversense.com"

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


ENV PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/tools:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/build-tools/${ANDROID_BUILD_TOOLS_VERSION}"

RUN yes Y | sdkmanager --licenses
RUN yes Y | sdkmanager --verbose --no_https "platform-tools"
RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_BUILD_TOOLS}
RUN yes Y | sdkmanager --verbose --no_https ${ANDROID_PLATFORM_VERSION}

# ===============================
# Check Python version
# ===============================

RUN python -v

# ===============================
# Third-part : r2
# ===============================

# ===============================
# Third-part : frida
# ===============================

# ===============================
# Third-part : apktool
# ===============================

# ===============================
# Third-part : baksmali
# ===============================

# ===============================
# Third-part : binwalk
# ===============================

