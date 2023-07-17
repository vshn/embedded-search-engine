# Step 1: Build the application
FROM docker.io/library/node:20-alpine3.17 AS builder

RUN npm install -g pkg pkg-fetch
ENV NODE node10
ENV PLATFORM alpine
ENV ARCH x64
RUN /usr/local/bin/pkg-fetch ${NODE} ${PLATFORM} ${ARCH}

# Run tests
WORKDIR /app
COPY . /app
RUN npm install
RUN npm test

# Build the application
RUN npm run build

# Package the result into a binary without dependencies
RUN /usr/local/bin/pkg --targets ${NODE}-${PLATFORM}-${ARCH} /app/dist/index.js -o server.bin


# Step 2: Create the runtime image
FROM docker.io/library/alpine:3.18
RUN apk add --no-cache libstdc++
COPY index /site/index
COPY --from=builder /app/server.bin /node/bin/server
EXPOSE 3000

# Don't run as root even in plain docker
USER 1001:0

ENTRYPOINT ["/node/bin/server"]
