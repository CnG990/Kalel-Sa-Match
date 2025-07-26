@echo off
echo ========================================
echo Test API Kalel Sa Match - Version Simple
echo ========================================

set API_URL=https://kalel-sa-match.onrender.com

echo.
echo Testing API Status...
curl -X GET "%API_URL%/api/status" -H "Accept: application/json"

echo.
echo.
echo Testing CORS...
curl -X GET "%API_URL%/api/test" -H "Accept: application/json"

echo.
echo.
echo Testing Terrains List...
curl -X GET "%API_URL%/api/terrains" -H "Accept: application/json"

echo.
echo.
echo Testing Protected Endpoint (should return 401)...
curl -X GET "%API_URL%/api/user/profile" -H "Accept: application/json"

echo.
echo.
echo ========================================
echo Tests completed!
echo ========================================
pause 