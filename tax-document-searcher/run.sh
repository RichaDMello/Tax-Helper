#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"

if command -v python3 >/dev/null 2>&1; then
  echo "Starting local document helper at http://localhost:${PORT}"
  echo "When the browser opens, follow the on-screen instructions."
  echo "Press Ctrl+C here when finished."
  python3 -m http.server "${PORT}"
elif command -v python >/dev/null 2>&1; then
  echo "Starting local document helper at http://localhost:${PORT}"
  echo "When the browser opens, follow the on-screen instructions."
  echo "Press Ctrl+C here when finished."
  python -m http.server "${PORT}"
else
  echo "Python is not installed. Open index.html directly in a browser instead."
  exit 1
fi
