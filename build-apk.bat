@echo off
echo Building Pairity APK...
cd pairity-app

echo Step 1: Installing dependencies...
call npm install

echo Step 2: Creating Android project...
call npx expo prebuild --platform android --clean

echo Step 3: Building Debug APK...
cd android
call gradlew.bat assembleDebug

echo.
echo ================================
echo BUILD COMPLETE!
echo ================================
echo.
echo Your APK is located at:
echo %cd%\app\build\outputs\apk\debug\app-debug.apk
echo.
pause