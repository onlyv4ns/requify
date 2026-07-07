#!/bin/sh
# Starts db, backend, and frontend. Ctrl-C stops backend/frontend (db keeps running).
set -e
cd "$(dirname "$0")"

docker compose up -d db

(cd backend && go run .) &
BACKEND_PID=$!

(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' INT TERM
wait $BACKEND_PID $FRONTEND_PID
