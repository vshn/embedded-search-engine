# Step 1: Build the application
FROM docker.io/library/node:20-alpine3.17 AS builder

RUN npm install -g pkg pkg-fetch
ENV NODE node18
ENV PLATFORM alpine
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${TARGETARCH}

# Run tests
WORKDIR /app
COPY . /app
RUN npm install
RUN npm test

# Build the application
RUN npm run build

# Package the result into a binary without dependencies
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${TARGETARCH} -o server.bin dist/src/index.js


# Step 2: Create the runtime image
FROM docker.io/library/alpine:3.19
RUN apk add --no-cache libstdc++
COPY index /site/index
COPY --from=builder /app/server.bin /node/bin/server
EXPOSE 3000

# Don't run as root even in plain docker
USER 1001:0

ENTRYPOINT ["/node/bin/server"]
