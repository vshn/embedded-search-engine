# Step 1: Build the application with TypeScript
FROM node:10.15.3-alpine AS builder

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . /app
RUN npm run build


# Step 2: Install only production libraries
FROM node:10.15.3-alpine AS installer

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production


# Step 3: Create the runtime image
FROM astefanutti/scratch-node:10.15.3

WORKDIR /site
COPY index /site/index
COPY --from=installer /app/node_modules /site/node_modules
COPY --from=builder /app/dist /site/dist
EXPOSE 3000

# Don't run as root even in plain docker
USER 1001:0

ENTRYPOINT ["node", "dist/index.js"]
