FROM node:10.14.2-alpine

WORKDIR /site
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . /site

EXPOSE 3000
CMD node_modules/.bin/ts-node src/index.ts

# Don't run as root even in plain docker
USER 1001:0
