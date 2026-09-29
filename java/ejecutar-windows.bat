@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
where java >nul 2>nul
if errorlevel 1 (
    echo No se encontró Java en este equipo.
    echo Instala un JDK 11 o posterior y agrega Java a la variable PATH.
    echo Luego vuelve a abrir este archivo. Consulta README-JAVA.md.
    pause
    exit /b 1
)
java -Dfile.encoding=UTF-8 ConariJava.java %*
if errorlevel 1 (
    echo.
    echo No se pudo iniciar la aplicación. Revisa el mensaje anterior.
    echo Necesitas un JDK 11 o posterior.
    pause
    exit /b 1
)
endlocal
