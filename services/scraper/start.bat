@echo off
REM Boot the Autocango scraper API on :8000
cd /d "%~dp0"
if not exist .venv (
  py -3.12 -m venv .venv
  .venv\Scripts\pip install -r requirements.txt
)
.venv\Scripts\uvicorn main:app --port 8000 --reload
