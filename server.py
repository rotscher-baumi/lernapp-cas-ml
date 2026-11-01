"""Static server for the Lernapp with a small JSON persistence endpoint (stdlib only)."""

import importlib.util
import json
import logging
import os
import select
import socket
import subprocess
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
STATE_FILE = Path(os.environ.get("STATE_FILE", ROOT / "data" / "state.json"))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8765))
HOST = os.environ.get("HOST", "127.0.0.1")  # set HOST=0.0.0.0 when deploying
JUPYTER_PREFIX = "/jupyter/"  # JupyterLab is started with --ServerApp.base_url=/jupyter/
JUPYTER_ADDR = (os.environ.get("JUPYTER_HOST", "127.0.0.1"), int(os.environ.get("JUPYTER_PORT", 8899)))
HOP_HEADERS = {"host", "origin", "connection", "keep-alive", "proxy-connection", "transfer-encoding"}
JUPYTER_TOKEN = "lernapp-local"
JUPYTER_LOG = ROOT / "data" / "jupyter.log"
_jupyter_lock = threading.Lock()


def jupyter_running() -> bool:
    try:
        socket.create_connection(JUPYTER_ADDR, timeout=0.5).close()
        return True
    except OSError:
        return False


def jupyter_python() -> str:
    """Python for JupyterLab: the repo's .venv (from requirements.txt) if present, else the server's own."""
    for venv_python in (ROOT / ".venv" / "Scripts" / "python.exe", ROOT / ".venv" / "bin" / "python"):
        if venv_python.exists():
            return str(venv_python)
    return sys.executable


def start_jupyter() -> str:
    """Start JupyterLab detached (it survives a server restart). Returns running, starting or missing."""
    with _jupyter_lock:
        if jupyter_running():
            return "running"
        python = jupyter_python()
        if python == sys.executable and importlib.util.find_spec("jupyterlab") is None:
            return "missing"
        cmd = [
            python,
            "-m",
            "jupyterlab",
            "--no-browser",
            f"--ip={JUPYTER_ADDR[0]}",
            f"--port={JUPYTER_ADDR[1]}",
            "--port-retries=0",
            f"--ServerApp.root_dir={ROOT}",
            f"--ServerApp.base_url={JUPYTER_PREFIX}",
            f"--IdentityProvider.token={JUPYTER_TOKEN}",
        ]
        JUPYTER_LOG.parent.mkdir(exist_ok=True)
        log = open(JUPYTER_LOG, "ab")
        if os.name == "nt":
            flags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW
            subprocess.Popen(cmd, cwd=ROOT, stdin=subprocess.DEVNULL, stdout=log, stderr=log, creationflags=flags)
        else:
            subprocess.Popen(cmd, cwd=ROOT, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)
        log.close()
        logging.info("Starting JupyterLab: %s", " ".join(cmd))
        return "starting"


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

    do_DELETE = do_PATCH = do_OPTIONS = _proxy_only

    def do_POST(self) -> None:
        if self.path != "/api/jupyter/start":
            self._proxy_only()
            return
        # Starting a process is only allowed from this machine, even when HOST=0.0.0.0. The custom
        # header forces a CORS preflight, which this server never grants, so other sites cannot trigger it.
        if self.client_address[0] not in ("127.0.0.1", "::1") or self.headers.get("X-Lernapp") != "1":
            self._json(403, b'{"status": "forbidden"}')
            return
        status = start_jupyter()
        body = {"status": status}
        if status == "missing":
            body["python"] = jupyter_python()
        self._json(500 if status == "missing" else 200, json.dumps(body).encode())

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
