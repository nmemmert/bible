#!/bin/bash

# Start Bible Study Hub - Backend (serves frontend statically)
echo "Starting Bible Study Hub..."

# Function to cleanup background processes
cleanup() {
    echo "Stopping service..."
    kill $backend_pid 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend in background (serves both API and static frontend)
cd backend
node server.js &
backend_pid=$!

echo "Backend PID: $backend_pid"
echo ""
echo "Service is starting up..."
echo "Application will be available at: http://localhost:8086"
echo ""
echo "Press Ctrl+C to stop the service"

# Wait for process
wait $backend_pid