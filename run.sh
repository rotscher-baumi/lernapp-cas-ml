#!/usr/bin/env bash
# Starts JupyterLab (port 8899, behind /jupyter/) and the Lernapp server (port 8765) from the repo's .venv.
cd "$(dirname "$0")" || exit 1
[ -x .venv/bin/jupyter-lab ] || { python3 -m venv .venv && .venv/bin/pip install -r requirements.txt; }
.venv/bin/jupyter-lab --no-browser --ip=127.0.0.1 --port=8899 --port-retries=0 \
  --ServerApp.root_dir="$PWD" --ServerApp.base_url=/jupyter/ --ServerApp.token=lernapp-local &
trap 'kill $! 2>/dev/null' EXIT
.venv/bin/python server.py "${1:-8765}"
