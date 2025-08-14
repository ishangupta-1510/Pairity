@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Building Pairity Debug APK...
echo Using Java from: %JAVA_HOME%

call gradlew.bat assembleDebug

echo.
if exist app\build\outputs\apk\debug\app-debug.apk (
    echo ================================
    echo BUILD SUCCESSFUL!
    echo ================================
    echo.
    echo Your APK is located at:
    echo %cd%\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo Build failed. Check the error messages above.
)
echo.
pause