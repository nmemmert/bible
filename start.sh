#!/bin/bash

# Start Bible Study Hub - Frontend and Backend
echo "Starting Bible Study Hub..."

# Function to cleanup background processes
cleanup() {
    echo "Stopping services..."
    kill $backend_pid $frontend_pid 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend in background
cd backend
npm run dev &
backend_pid=$!

# Start frontend in background
npm run dev:frontend &
frontend_pid=$!

echo "Backend PID: $backend_pid"
echo "Frontend PID: $frontend_pid"
echo ""
echo "Both services are starting up..."
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:12345"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for processes
wait $backend_pid $frontend_pid