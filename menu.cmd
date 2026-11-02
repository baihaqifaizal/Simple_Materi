@echo off
title Simple Materi - Panel Menu Utama
cd /d "%~dp0"

:MENU
cls
echo ========================================================
echo            SIMPLE MATERI - KELOLA WEB GURU
echo ========================================================
echo.
echo   [1] Buka Dashboard Admin (Kelola Guru, Settings, MD)
echo   [2] 1-Klik Deploy Cloudflare Pages (Semua Guru Otomatis)
echo   [3] Run Dev (Live Preview Materi Guru Tertentu)
echo   [4] Keluar
echo.
echo ========================================================
set /p PILIHAN="Pilih nomor [1-4]: "

if "%PILIHAN%"=="1" goto DASHBOARD
if "%PILIHAN%"=="2" goto DEPLOY
if "%PILIHAN%"=="3" goto RUNDEV
if "%PILIHAN%"=="4" goto KELUAR

echo.
echo Pilihan tidak valid! Silakan tekan tombol apa saja...
pause >nul
goto MENU

:DASHBOARD
cls
echo ========================================================
echo   [1] Menjalankan Dashboard Admin...
echo   Alamat: http://localhost:3001
echo ========================================================
echo.
node server.mjs
echo.
pause
goto MENU

:DEPLOY
cls
echo ========================================================
echo   [2] 1-Klik Deploy ke Cloudflare Pages (simple-materi)
echo ========================================================
echo.
echo Mem-build seluruh materi semua guru dan langsung deploy...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\build.ps1' -Deploy -Provider cloudflare"
echo.
pause
goto MENU

:RUNDEV
cls
echo ========================================================
echo   [3] Menjalankan Mode Tulis (Run Dev)
echo ========================================================
echo.
set /p TARGET="Ketik nama folder guru (contoh: boy) [default: boy]: "
if "%TARGET%"==" " set TARGET=boy
if "%TARGET%"=="" set TARGET=boy
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '.\build.ps1' -Target '%TARGET%' -Watch"
echo.
pause
goto MENU

:KELUAR
cls
exit
