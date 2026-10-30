"""Static server for the Lernapp with a small JSON persistence endpoint (stdlib only)."""
import json
import logging
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
STATE_FILE = ROOT / "data" / "state.json"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _json(self, status: int, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path == "/api/state":
            body = STATE_FILE.read_bytes() if STATE_FILE.exists() else b"{}"
            self._json(200, body)
        else:
            super().do_GET()

    def do_PUT(self) -> None:
        if self.path != "/api/state":
            self.send_error(404)
            return
        raw = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        try:
            data = json.loads(raw)
            if not isinstance(data, dict):
                raise ValueError("state must be an object")
        except ValueError:
            self.send_error(400, "invalid JSON")
            return
        STATE_FILE.parent.mkdir(exist_ok=True)
        tmp = STATE_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        tmp.replace(STATE_FILE)
        self._json(200, b"{}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Lernapp on http://localhost:%d", PORT)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
