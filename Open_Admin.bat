@echo off
title Portfolio Admin Tunnel
color 0A
echo ===================================================
echo   HE THONG QUAN TRI PORTFOLIO - SSH TUNNEL
echo ===================================================
echo.
echo Dang mo duong ham bao mat vao VPS...
echo Vui long nhap mat khau cua VPS neu he thong yeu cau.
echo.
echo ===================================================
echo [HUONG DAN]
echo 1. Sau khi go mat khau xong, dac cu vao day, KHONG TAT cua so nay.
echo 2. Mo trinh duyet va vao: http://localhost:3005/admin.html
echo 3. Khi nao khong dung Admin nua, ban chi can tat cua so nay di.
echo ===================================================
echo.
ssh -L 3005:localhost:3005 root@167.233.61.186
pause
