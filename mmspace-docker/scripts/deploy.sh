#!/bin/bash

echo "Deploying MMSpace application..."

# Stop existing containers
docker-compose down

# Pull latest images and build
docker-compose build --no-cache

# Start services
docker-compose up -d

echo "Deployment completed! Application is running at:"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "MongoDB: mongodb://localhost:27017"