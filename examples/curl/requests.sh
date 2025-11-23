#!/bin/bash

API_URL="https://your-api.koyeb.app"

# Get user profile
echo "Fetching user profile..."
curl -X GET "$API_URL/api/v1/user/khaby.lame"

# Health check
echo -e "\n\nChecking API health..."
curl -X GET "$API_URL/health"

# API info
echo -e "\n\nGetting API info..."
curl -X GET "$API_URL/"