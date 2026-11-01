"""Shared fixtures: server.py imported with a clean argv, an in-process server and a fake JupyterLab."""

import http.client
import socket
import sys
import threading
from collections.abc import Iterator
from dataclasses import dataclass, field
from http.server import ThreadingHTTPServer
from pathlib import Path
from types import ModuleType

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session")
def server_module() -> ModuleType:
    """Import server.py once. It reads the port from sys.argv[1] at import time, which would be a pytest argument."""
    saved = sys.argv
    sys.argv = ["server.py"]
    try:
        import server
    finally:
        sys.argv = saved
    return server


@dataclass
class Response:
    status: int
    headers: dict[str, str]
    body: bytes


@dataclass
class App:
    """A running Lernapp server on a free port."""

    host: str
    port: int

    def request(
        self, method: str, path: str, body: bytes | None = None, headers: dict[str, str] | None = None
    ) -> Response:
        """Send one request and return status, lower-cased headers and body.

        :param method: HTTP method.
        :param path: request path including the query string.
        :param body: optional request body.
        :param headers: optional headers; a ``Host`` entry replaces the default.
        :return: the parsed response.
        """
        conn = http.client.HTTPConnection(self.host, self.port, timeout=10)
        try:
            conn.request(method, path, body=body, headers=headers or {})
            resp = conn.getresponse()
            return Response(resp.status, {k.lower(): v for k, v in resp.getheaders()}, resp.read())
        finally:
            conn.close()


@pytest.fixture
def app(server_module: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[App]:
    monkeypatch.setattr(server_module, "STATE_FILE", tmp_path / "state.json")
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), server_module.Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield App("127.0.0.1", httpd.server_address[1])
    finally:
        httpd.shutdown()
        httpd.server_close()


@dataclass
class Upstream:
    """A fake JupyterLab that records the raw request head and answers with a fixed body."""

    port: int
    requests: list[str] = field(default_factory=list)


@pytest.fixture
def upstream(server_module: ModuleType, monkeypatch: pytest.MonkeyPatch) -> Iterator[Upstream]:
    listener = socket.socket()
    listener.bind(("127.0.0.1", 0))
    listener.listen()
    fake = Upstream(listener.getsockname()[1])

    def serve() -> None:
        while True:
            try:
                conn, _ = listener.accept()
            except OSError:
                return
            with conn:
                data = b""
                while b"\r\n\r\n" not in data:
                    chunk = conn.recv(4096)
                    if not chunk:
                        break
                    data += chunk
                fake.requests.append(data.decode("latin-1"))
                conn.sendall(b"HTTP/1.1 200 OK\r\nContent-Length: 10\r\nConnection: close\r\n\r\njupyter-ok")

    threading.Thread(target=serve, daemon=True).start()
    monkeypatch.setattr(server_module, "JUPYTER_ADDR", ("127.0.0.1", fake.port))
    try:
        yield fake
    finally:
        listener.close()
