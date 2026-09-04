# Multi-stage Dockerfile for RTFM SkillOS

# 1. Build Client
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
COPY shared/ ./shared/
# Vite needs to resolve ../shared if imported
RUN cd client && npm run build

# 2. Build Server
FROM node:20-alpine AS server-build
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/
COPY shared/ ./shared/
# We use tsx for running the server in this prototype, so we don't strictly need a tsc build step,
# but installing dependencies is necessary.

# 3. Production Image
FROM node:20-alpine
WORKDIR /app

# Install system dependencies for Tesseract OCR (if native bindings are used)
RUN apk add --no-cache tesseract-ocr

# Copy server and shared
COPY --from=server-build /app/server ./server
COPY --from=server-build /app/shared ./shared

# Copy built client to be served by the server (needs express.static update in index.ts)
COPY --from=client-build /app/client/dist ./client/dist

WORKDIR /app/server
EXPOSE 5001

CMD ["npx", "tsx", "index.ts"]
