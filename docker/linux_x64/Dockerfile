# =================== DEXCALIBUR MAIN IMAGE =====================
# Uses pre-built base image with all third-party dependencies
# Only application-specific configuration and artifacts
# ================================================================

# Use the base image (build locally or from registry)
# To build base: docker build -f Dockerfile.base -t dexcalibur-base:latest .
# To use registry: FROM your-registry/dexcalibur-base:1.0.0
FROM dexcalibur-base:latest

LABEL maintainer="georges.michel@reversense.com"
LABEL description="Dexcalibur server application"

# ===============================
# Application Args
# ===============================
ARG user_server="dexcalibur-bin"
ARG dxc_http_port=8080
ARG dxc_ws_port=8001
ARG dxc_https_port=8443
ARG dxc_heap_size=4096
ARG marketplace_uri="official"

ARG dxc_db_host="127.0.0.1"
ARG dxc_db_port="27017"
ARG dxc_db_user="master"
ARG dxc_db_passwd="master123"
ARG dxc_db_mode="DEFAULT"

ARG dxc_uis="home,pro"

# ===============================
# Application Environment
# ===============================
ENV DXC_USER_SRV=${user_server}
ENV DXC_HTTP_PORT=${dxc_http_port}
ENV DXC_WS_PORT=${dxc_ws_port}
ENV DXC_HTTPS_PORT=${dxc_https_port}
ENV DXC_HEAP_SZ=${dxc_heap_size}
ENV DXC_NODE_HEAP_SZ=4096
ENV DXC_REL_PATH=""

ENV DXC_DB_HOST=${dxc_db_host}
ENV DXC_DB_PORT=${dxc_db_port}
ENV DXC_DB_USER=${dxc_db_user}
ENV DXC_DB_PWD=${dxc_db_passwd}
ENV DXC_DB_MODE=${dxc_db_mode}

ENV DXC_BASE_PATH=""
ENV DXC_BUILD_TARGET=""

# ===============================
# Paths from base image
# ===============================
ENV DXC_USER_HOME="/home/${user_server}"
ENV TMP_FOLDER="${DXC_USER_HOME}/tmp"
ENV ARTIFACTS_FOLDER="${DXC_USER_HOME}/artifacts"
ENV DXC_BIN_FOLDER="${DXC_USER_HOME}/tmp"
ENV ANDROID_SDK_ROOT="${DXC_USER_HOME}/android"

# ===============================
# Volumes
# ===============================
VOLUME ["${DXC_USER_HOME}/workspace", "/uis", "/security"]

# ===============================
# Switch to application user
# ===============================
USER ${DXC_USER_SRV}
WORKDIR ${DXC_USER_HOME}

# ===============================
# Create artifacts directory
# ===============================
RUN mkdir -p ${ARTIFACTS_FOLDER}

# ===============================
# Install Frida (version-specific)
# ===============================
COPY frida_version "${ARTIFACTS_FOLDER}/frida_version"

RUN IMPORTED_FRIDA_VER=$(cat "${ARTIFACTS_FOLDER}/frida_version") && \
    pip install frida==${IMPORTED_FRIDA_VER} frida-tools

# ===============================
# Install Dexcalibur Server
# ===============================
COPY dxc-server-linux.tar.gz "${ARTIFACTS_FOLDER}/dxc-server.tar.gz"

RUN sudo chown -R ${DXC_USER_SRV}:${DXC_USER_SRV} ${ARTIFACTS_FOLDER} && \
    cd "${ARTIFACTS_FOLDER}" && \
    tar xzf "${ARTIFACTS_FOLDER}/dxc-server.tar.gz" && \
    rm -f "${ARTIFACTS_FOLDER}/dxc-server.tar.gz"

# ===============================
# Configure Server
# ===============================
WORKDIR "${ARTIFACTS_FOLDER}/dist"

RUN mkdir -p ${DXC_USER_HOME}/.dexcalibur && \
    ln -s /uis ${ARTIFACTS_FOLDER}/dist/src/webserver/www && \
    chown -R ${DXC_USER_SRV}:${DXC_USER_SRV} ${DXC_USER_HOME}/.dexcalibur && \
    node ./dexcalibur-adm.mjs server \
        --create-home=${DXC_USER_HOME}/.dexcalibur \
        --db-host=${DXC_DB_HOST} \
        --db-port=${DXC_DB_PORT} \
        --set-marketplace=${marketplace_uri} \
        --set-wsi=${DXC_USER_HOME}/.dexcalibur/.dxc \
        --create-ws=${DXC_USER_HOME}/workspace \
        --heap-size=${DXC_HEAP_SZ} \
        --http-port=${DXC_HTTP_PORT} \
        --ws-port=${DXC_WS_PORT} && \
    echo "${DXC_DB_USER}:${DXC_DB_PWD}:admin:${DXC_DB_MODE}" > ${DXC_USER_HOME}/.dexcalibur/db.credentials && \
    node ./dexcalibur-adm.mjs server --db-credential=${DXC_USER_HOME}/.dexcalibur/db.credentials

# ===============================
# Configure External Tools
# ===============================
RUN chmod -R 755 ${DXC_USER_HOME}/.dexcalibur/.dxc && \
    mv "${TMP_FOLDER}/baksmali.jar" ${DXC_USER_HOME}/.dexcalibur/.dxc/bin/baksmali.jar && \
    mv "${TMP_FOLDER}/apktool.jar" ${DXC_USER_HOME}/.dexcalibur/.dxc/bin/apktool.jar && \
    node ./dexcalibur-adm.mjs tools --name=java --path=java && \
    node ./dexcalibur-adm.mjs tools --name=python --path=python3 && \
    node ./dexcalibur-adm.mjs tools --name=frida --path=frida && \
    node ./dexcalibur-adm.mjs tools --name=radare2 --path=r2 && \
    node ./dexcalibur-adm.mjs tools --name=adb --path=${ANDROID_SDK_ROOT}/platform-tools/adb && \
    node ./dexcalibur-adm.mjs tools --name=binwalk --path=binwalk && \
    node ./dexcalibur-adm.mjs tools --name=shell --path=/bin/sh && \
    node ./dexcalibur-adm.mjs tools --name=baksmali --path=${DXC_USER_HOME}/.dexcalibur/.dxc/bin/baksmali.jar && \
    node ./dexcalibur-adm.mjs tools --name=apktool --path=${DXC_USER_HOME}/.dexcalibur/.dxc/bin/apktool.jar

# ===============================
# Verify Installation
# ===============================
RUN node ./dexcalibur-adm.mjs server -l && \
    node ./dexcalibur-adm.mjs tools -l && \
    node ./dexcalibur-adm.mjs tools --check

# ===============================
# Expose Ports
# ===============================
EXPOSE ${DXC_HTTP_PORT} ${DXC_WS_PORT} ${DXC_HTTPS_PORT}

# ===============================
# Entrypoint
# ===============================
ENTRYPOINT ["node", "./dexcalibur.js"]
