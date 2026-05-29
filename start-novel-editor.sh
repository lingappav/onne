#!/bin/bash
# Starts both the Novel API backend and the Angular frontend
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Kill any stale instances
pkill -f "node server.js" 2>/dev/null
pkill -f "ng serve" 2>/dev/null
sleep 1

echo "Starting Novel API backend on http://localhost:3001 ..."
cd "$ROOT/novel-api" && node server.js &
API_PID=$!
echo "API PID: $API_PID"

echo "Starting Angular frontend on http://localhost:4200 ..."
cd "$ROOT/novel-ui" && npx ng serve --open &
ANGULAR_PID=$!
echo "Angular PID: $ANGULAR_PID"

echo ""
echo "Novel Editor is starting..."
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $API_PID $ANGULAR_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
