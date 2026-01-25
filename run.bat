@echo off
start cmd /k "cd server && npm run dev"
start cmd /k "cd client && npm run dev"
echo Wanderlist is starting...
echo Server running on http://localhost:5000
echo Client running on http://localhost:5173
pause
