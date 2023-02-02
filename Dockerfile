# ------------------------- Dexcalibur Docker image
FROM ubuntu:20.04

MAINTAINER cryptax
ENV REFRESHED_AT 2023-01-19

ARG DEBIAN_FRONTEND=noninteractive
ARG JDK_VERSION=8
ENV FRIDA_VERSION 16.0.8
ENV FRIDA_SERVER frida-server-${FRIDA_VERSION}-android-x86_64.xz


# --------------------- Various requirements -------------------------
RUN apt-get update && \
       apt-get install -yqq curl dirmngr apt-transport-https lsb-release ca-certificates adb \
        python3-pip python openjdk-${JDK_VERSION}-jdk build-essential wget bash git

# ----------------------- Install NodeJS -----------------------------------------------        


RUN mkdir /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 19.4.0

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN node -v
RUN npm -v

# ----------------------- Install Frida -----------------------------------------------        
RUN pip3 install frida-tools
RUN mkdir -p /workshop && wget -q -O /workshop/${FRIDA_SERVER} https://github.com/frida/frida/releases/download/${FRIDA_VERSION}/${FRIDA_SERVER} && cd /workshop && unxz ${FRIDA_SERVER}

# ----------------------- Install Dexcalibur -----------------------------------------------
RUN git clone https://github.com/FrenchYeti/dexcalibur
RUN cd dexcalibur && npm install -g 

# ------------------------- Clean up
RUN apt-get clean && apt-get autoclean && apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /tmp/* /usr/share/doc/* > /dev/null 2>&1

# ------------------------- Final matter
WORKDIR /workshop
VOLUME ["/data"] 
CMD [ "/bin/bash" ]


EXPOSE 8000

