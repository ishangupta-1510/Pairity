@echo off
echo Building Pairity Release APK...
cd pairity-app

echo Step 1: Installing dependencies...
call npm install

echo Step 2: Creating Android project...
call npx expo prebuild --platform android --clean

echo Step 3: Building Release APK...
cd android
call gradlew.bat assembleRelease

echo.
echo ================================
echo BUILD COMPLETE!
echo ================================
echo.
echo Your Release APK is located at:
echo %cd%\app\build\outputs\apk\release\app-release.apk
echo.
echo Note: This APK is unsigned. You'll need to sign it for distribution.
echo.
pause