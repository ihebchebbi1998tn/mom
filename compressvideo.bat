@echo off
setlocal enabledelayedexpansion

:: ===========================
:: CONFIG
:: ===========================
set "inputFolder=C:\Users\iheb.chebbi\Desktop\ihlmobile\Mom academy\الطفل العنيد"
set "compressedFolder=%inputFolder%\compressed"
set "ffmpegExe=%~dp0ffmpeg-8.0\bin\ffmpeg.exe"

:: ===========================
:: CHECK FFMPEG
:: ===========================
if not exist "%ffmpegExe%" (
    echo ❌ ERROR: FFmpeg not found at "%ffmpegExe%"
    echo Please make sure "ffmpeg-8.0\bin\ffmpeg.exe" is in the same folder as this .bat file.
    pause
    exit /b
) else (
    echo ✅ Using FFmpeg from: "%ffmpegExe%"
)

:: ===========================
:: CREATE COMPRESSED FOLDER
:: ===========================
if not exist "%compressedFolder%" (
    echo Creating folder: "%compressedFolder%"
    mkdir "%compressedFolder%"
)

:: ===========================
:: COMPRESS VIDEOS
:: ===========================
cd /d "%inputFolder%"
for %%a in ("*.mp4") do (
    echo Compressing: %%a
    "%ffmpegExe%" -i "%%a" -vcodec libx264 -crf 28 -preset slower -acodec aac -b:a 128k "%compressedFolder%\%%~na.mp4"
)

echo ======================================
echo ✅ Done! Compressed videos are in:
echo "%compressedFolder%"
echo ======================================
pause
