# Step 1: Build the application with TypeScript
FROM node:10.15.3-alpine AS builder

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install
COPY . /app
RUN npm run build


# Step 2: Create the runtime image
FROM node:10.15.3-alpine

WORKDIR /site
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production
COPY index /site/index
COPY --from=builder /app/dist /site/dist
EXPOSE 3000

# Don't run as root even in plain docker
USER 1001:0

CMD npm start
