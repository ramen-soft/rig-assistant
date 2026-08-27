@echo off
setlocal

cd /d "%~dp0"

echo Comprobando Node.js...

call node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    exit /b 1
)

echo Node.js encontrado:
call node --version


echo.
echo Comprobando pnpm...

call pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pnpm no esta instalado.
    exit /b 1
)

echo pnpm encontrado:
call pnpm --version

echo.
echo Todo correcto.

call pnpm install -y

echo.
echo Instalando Mastra...
echo.

if not exist mastra (
	call pnpm create mastra@latest mastra --llm openai
	if errorlevel 1 (
		echo ERROR: No se pudo crear Mastra.
		exit /b 1
	)
)

cd /d mastra

echo.
echo Instalando dependencias...
echo.

call pnpm install -y
if errorlevel 1 (
	echo ERROR: pnpm install ha fallado.
	exit /b 1
)

call pnpm add ai @mastra/ai-sdk @mastra/mcp ollama-ai-provider-v2
if errorlevel 1 (
	echo ERROR: No se pudieron instalar las dependencias.
	exit /b 1
)

cd /d "%~dp0"

echo.
echo Copiando agente...
copy /Y ".\_agents\assistant.ts" ".\mastra\src\mastra\agents\assistant.ts"
if not exist ".\mastra\src\mastra\mcp" (
	mkdir ".\mastra\src\mastra\mcp"
)

copy /Y ".\_agents\rigctl.ts" ".\mastra\src\mastra\mcp\rigctl.ts"
copy /Y ".\_agents\index.ts" ".\mastra\src\mastra\index.ts"

echo.
echo Mastra instalado correctamente.
echo.

cd /d "%~dp0"

echo.
echo Instalando STT...

for /f "delims=" %%i in ('where python 2^>nul') do (
    set "PYTHON=%%i"
    goto :python_found
)

echo Python no encontrado
exit /b 1

:python_found
echo Python encontrado en:
echo %PYTHON%

cd ".\stt"
call venv\scripts\python.exe -m pip install -r requirements.txt

echo.
echo Instalando Rig MCP Server...
cd /d "%~dp0"
cd /d rig-server
call pnpm install -y
if errorlevel 1 (
	echo ERROR: No se pudo instalar Rig MCP Server.
	exit /b 1
)

cd /d "%~dp0"
echo.
echo Instalando Frontend Web...
cd /d rig-ctl-Web
call pnpm install -y
if errorlevel 1 (
	echo ERROR: No se pudo instalar Frontend Web.
	exit /b 1
)

pause