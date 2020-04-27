FROM node:10.20.1-alpine

LABEL \
    maintainer="vshn" \
    org.label-schema.build-date=$BUILD_DATE \
    org.label-schema.docker.dockerfile="/Dockerfile" \
    org.label-schema.license="BSD 3-clause 'New' or 'Revised' License" \
    org.label-schema.name="vshn/embedded-search-engine" \
    org.label-schema.url="https://github.com/vshn/embedded-search-engine" \
    org.label-schema.vcs-ref=$VCS_REF \
    org.label-schema.vcs-type="Git" \
    org.label-schema.version=$VERSION \
    org.label-schema.vcs-url="https://github.com/vshn/embedded-search-engine"

WORKDIR /site
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . /site

EXPOSE 3000
CMD node_modules/.bin/ts-node src/index.ts

# Don't run as root even in plain docker
USER 1001:0
