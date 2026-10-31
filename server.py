"""Static server for the Lernapp with a small JSON persistence endpoint (stdlib only)."""
import json
import logging
import os
import select
import socket
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
STATE_FILE = Path(os.environ.get("STATE_FILE", ROOT / "data" / "state.json"))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8765))
HOST = os.environ.get("HOST", "127.0.0.1")  # set HOST=0.0.0.0 when deploying
JUPYTER_PREFIX = "/jupyter/"  # JupyterLab is started with --ServerApp.base_url=/jupyter/
JUPYTER_ADDR = (os.environ.get("JUPYTER_HOST", "127.0.0.1"), int(os.environ.get("JUPYTER_PORT", 8899)))
HOP_HEADERS = {"host", "origin", "connection", "keep-alive", "proxy-connection", "transfer-encoding"}


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

    def _proxy_jupyter(self) -> None:
        """Tunnel the request (HTTP or WebSocket upgrade) to JupyterLab so only one port needs forwarding."""
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""
        upgrade = self.headers.get("Upgrade")
        head = [f"{self.command} {self.path} HTTP/1.1", f"Host: {JUPYTER_ADDR[0]}:{JUPYTER_ADDR[1]}"]
        if self.headers.get("Origin"):
            head.append(f"Origin: http://{JUPYTER_ADDR[0]}:{JUPYTER_ADDR[1]}")
        head.append("Connection: Upgrade" if upgrade else "Connection: close")
        head += [f"{k}: {v}" for k, v in self.headers.items() if k.lower() not in HOP_HEADERS]
        try:
            up = socket.create_connection(JUPYTER_ADDR, timeout=5)
        except OSError:
            self.send_error(502, "JupyterLab is not running")
            return
        self.close_connection = True
        with up:
            up.settimeout(None)
            up.sendall(("\r\n".join(head) + "\r\n\r\n").encode("latin-1") + body)
            socks = [self.connection, up]
            while True:
                ready, _, _ = select.select(socks, [], [], 3600)
                if not ready:
                    return
                for src in ready:
                    try:
                        data = src.recv(65536)
                    except OSError:
                        return
                    if not data:
                        return
                    try:
                        (up if src is self.connection else self.connection).sendall(data)
                    except OSError:
                        return

    def _is_jupyter(self) -> bool:
        return self.path.startswith(JUPYTER_PREFIX) or self.path == JUPYTER_PREFIX.rstrip("/")

    def do_GET(self) -> None:
        if self._is_jupyter():
            self._proxy_jupyter()
        elif self.path == "/api/state":
            body = STATE_FILE.read_bytes() if STATE_FILE.exists() else b"{}"
            self._json(200, body)
        else:
            super().do_GET()

    def _proxy_only(self) -> None:
        if self._is_jupyter():
            self._proxy_jupyter()
        else:
            self.send_error(405)

    do_POST = do_DELETE = do_PATCH = do_OPTIONS = _proxy_only

    def do_HEAD(self) -> None:
        if self._is_jupyter():
            self._proxy_jupyter()
        else:
            super().do_HEAD()

    def do_PUT(self) -> None:
        if self._is_jupyter():
            self._proxy_jupyter()
            return
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
    logging.info("Lernapp on http://%s:%d", HOST, PORT)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
