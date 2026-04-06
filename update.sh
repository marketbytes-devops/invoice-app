#!/bin/bash

# Configuration
PROJECT_DIR="$(pwd)"
BRANCH="master"

echo "==========================================="
echo "   RESTARTING & UPDATING INVOICE SYSTEM    "
echo "==========================================="

# Pull latest changes
echo ">>> Pulling latest changes from $BRANCH..."
git pull origin $BRANCH

# Build and start containers
echo ">>> Building and starting services with Docker Compose..."
docker compose up --build -d

# Cleanup unused images/volumes (optional, saves space)
echo ">>> Cleaning up old, unused images..."
docker image prune -f

echo "==========================================="
echo "           DEPLOYMENT COMPLETE             "
echo "==========================================="
