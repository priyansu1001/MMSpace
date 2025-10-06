FROM node:24.9.0-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install build/runtime dependencies and utilities (wget used by healthcheck)
RUN apk add --no-cache ca-certificates wget \
    && npm ci --only=production \
    && update-ca-certificates

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

# Use npm start for production
CMD ["npm", "start"]