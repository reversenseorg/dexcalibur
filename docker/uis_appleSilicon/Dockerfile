# =================== BUILD STAGE =====================
FROM rg.fr-par.scw.cloud/reversense/dxc-core-server:cicd-context-apple
LABEL maintainer="georges.michel@reversense.com"

ARG black_ui="pro"
ARG white_ui="home"

ENV ARTIFACTS_FOLDER_UIS=$ARTIFACTS_FOLDER"_uis"

RUN mkdir $ARTIFACTS_FOLDER_UIS

# =================== WHITE UI =====================
# Copy Home UI artifacts
COPY dxc-home-dist.tar.gz $ARTIFACTS_FOLDER_UIS/dxc-home-dist.tar.gz
RUN cd $ARTIFACTS_FOLDER_UIS && \
    tar xvf $ARTIFACTS_FOLDER_UIS/dxc-home-dist.tar.gz && \
    mv $ARTIFACTS_FOLDER_UIS/dist/dexcalibur-home $ARTIFACTS_FOLDER/dist/src/webserver/www/home

# =================== BLACK UI =====================
# Copy Pro UI artifacts
COPY dxc-pro-dist.tar.gz $ARTIFACTS_FOLDER_UIS/dxc-pro-dist.tar.gz
RUN cd $ARTIFACTS_FOLDER_UIS && \
    tar xvf $ARTIFACTS_FOLDER_UIS/dxc-pro-dist.tar.gz && \
    mv $ARTIFACTS_FOLDER_UIS/dist/dxc-ui-reverse $ARTIFACTS_FOLDER/dist/src/webserver/www/pro


ENTRYPOINT [ "node", "./dexcalibur.js" ]