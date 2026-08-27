#!/bin/bash

echo "========================================="
echo "      SkillOS - Setup and Start"
echo "========================================="

echo ""
echo "[1/2] Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies."
    exit 1
fi
cd ..

echo ""
echo "[2/2] Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies."
    exit 1
fi
cd ..

echo ""
echo "Starting servers..."

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit
}

# Setup trap to catch Ctrl+C (SIGINT) and termination (SIGTERM)
trap cleanup SIGINT SIGTERM

cd server
npm run dev &
SERVER_PID=$!
cd ..

cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo "Servers are running! Press Ctrl+C to stop both."

# Wait for background processes
wait $SERVER_PID
wait $CLIENT_PID
