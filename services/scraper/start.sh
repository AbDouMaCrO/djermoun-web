#!/usr/bin/env bash
# Boot the Autocango scraper API on :8000
set -e
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  py -3.12 -m venv .venv 2>/dev/null || python3.12 -m venv .venv
  .venv/Scripts/pip install -r requirements.txt 2>/dev/null || .venv/bin/pip install -r requirements.txt
fi

# Windows venvs use Scripts/, POSIX uses bin/
if [ -f .venv/Scripts/uvicorn ]; then
  .venv/Scripts/uvicorn main:app --port 8000 --reload
else
  .venv/bin/uvicorn main:app --port 8000 --reload
fi
