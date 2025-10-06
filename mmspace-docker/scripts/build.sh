#!/bin/bash

echo "Building MMSpace Docker containers..."

# Build all services
docker-compose build --no-cache

echo "Build completed successfully!"