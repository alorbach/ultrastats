@echo off
REM UltraStats — install-e2e Playwright testbench (Docker: MySQL + PHP + Playwright).
REM Resolves to repo root (parent of this file). Stops on first error.
REM
REM   docker\testbench-install.bat           full clean: docker down -v, restore stashed config if present, run tests
REM   docker\testbench-install.bat noreset   skip "down -v" (faster re-runs; same DB volume until you clean it)
REM
cd /d "%~dp0\.."

if /I "%~1"=="noreset" (
  echo [install-e2e] Skipping docker down -v ^(noreset^)
) else (
  echo [install-e2e] Stopping stack and removing MySQL volume...
  docker compose -f docker/docker-compose.install-e2e.yml down -v
  if errorlevel 1 exit /b 1
)

if exist "src\config.php.ultrastats-e2e-stash" (
  echo [install-e2e] Restoring stashed config: config.php.ultrastats-e2e-stash -^> config.php
  move /Y "src\config.php.ultrastats-e2e-stash" "src\config.php"
  if errorlevel 1 exit /b 1
) else (
  echo [install-e2e] No config.php.ultrastats-e2e-stash, leaving config.php as-is.
)

echo [install-e2e] Building and running Playwright install wizard + post-install tests...
docker compose -f docker/docker-compose.install-e2e.yml up --build --abort-on-container-exit --exit-code-from playwright
set EC=%ERRORLEVEL%

if not "%EC%"=="0" (
  echo [install-e2e] FAILED (exit %EC%^)
) else (
  echo [install-e2e] OK. Reports: e2e\install-e2e-report\index.html  e2e\playwright-report\index.html
)
exit /b %EC%
