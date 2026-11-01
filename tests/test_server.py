"""Behavior of server.py: static files, state storage, Jupyter start and the Jupyter proxy."""

import json
import os
import sys
from pathlib import Path
from types import ModuleType

import pytest
from conftest import App, Upstream

START = "/api/jupyter/start"


def test_serves_static_files(app: App) -> None:
    resp = app.request("GET", "/index.html")
    assert resp.status == 200
    assert b"CAS ML" in resp.body


def test_state_defaults_to_empty_object(app: App) -> None:
    resp = app.request("GET", "/api/state")
    assert resp.status == 200
    assert json.loads(resp.body) == {}


def test_state_roundtrip_keeps_unicode(app: App, tmp_path: Path) -> None:
    saved = {"übung": "größer", "n": 3}
    assert app.request("PUT", "/api/state", json.dumps(saved).encode()).status == 200
    assert json.loads(app.request("GET", "/api/state").body) == saved
    assert not list(tmp_path.glob("*.tmp")), "temporary file must be renamed away"


@pytest.mark.parametrize("body", [b"not json", b"[1, 2]", b'"text"', b""])
def test_state_rejects_invalid_payload(app: App, body: bytes) -> None:
    assert app.request("PUT", "/api/state", body).status == 400
    assert json.loads(app.request("GET", "/api/state").body) == {}


def test_put_to_unknown_path_is_404(app: App) -> None:
    assert app.request("PUT", "/api/other", b"{}").status == 404


def test_post_to_unknown_path_is_405(app: App) -> None:
    assert app.request("POST", "/api/state", b"{}").status == 405


class TestJupyterPython:
    def test_falls_back_to_the_servers_python(
        self, server_module: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "ROOT", tmp_path)
        assert server_module.jupyter_python() == sys.executable

    @pytest.mark.parametrize("relative", [".venv/Scripts/python.exe", ".venv/bin/python"])
    def test_prefers_the_repo_venv(
        self, server_module: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch, relative: str
    ) -> None:
        interpreter = tmp_path / relative
        interpreter.parent.mkdir(parents=True)
        interpreter.touch()
        monkeypatch.setattr(server_module, "ROOT", tmp_path)
        assert server_module.jupyter_python() == str(interpreter)


class TestStartJupyter:
    @pytest.fixture
    def popen_calls(
        self, server_module: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> list[tuple[list[str], dict]]:
        calls: list[tuple[list[str], dict]] = []

        def fake_popen(cmd: list[str], **kwargs: object) -> None:
            calls.append((cmd, kwargs))

        monkeypatch.setattr(server_module.subprocess, "Popen", fake_popen)
        monkeypatch.setattr(server_module, "JUPYTER_LOG", tmp_path / "data" / "jupyter.log")
        return calls

    def test_does_nothing_when_already_running(
        self, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch, popen_calls: list
    ) -> None:
        monkeypatch.setattr(server_module, "jupyter_running", lambda: True)
        assert server_module.start_jupyter() == "running"
        assert popen_calls == []

    def test_reports_missing_jupyterlab(
        self, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch, popen_calls: list
    ) -> None:
        monkeypatch.setattr(server_module, "jupyter_running", lambda: False)
        monkeypatch.setattr(server_module, "jupyter_python", lambda: sys.executable)
        monkeypatch.setattr(server_module.importlib.util, "find_spec", lambda name: None)
        assert server_module.start_jupyter() == "missing"
        assert popen_calls == []

    def test_starts_detached_with_the_expected_settings(
        self, server_module: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch, popen_calls: list
    ) -> None:
        monkeypatch.setattr(server_module, "jupyter_running", lambda: False)
        monkeypatch.setattr(server_module, "jupyter_python", lambda: "venv-python")
        assert server_module.start_jupyter() == "starting"

        ((cmd, kwargs),) = popen_calls
        assert cmd[:3] == ["venv-python", "-m", "jupyterlab"]
        assert "--no-browser" in cmd
        assert f"--ServerApp.root_dir={server_module.ROOT}" in cmd
        assert f"--ServerApp.base_url={server_module.JUPYTER_PREFIX}" in cmd
        assert f"--IdentityProvider.token={server_module.JUPYTER_TOKEN}" in cmd
        assert kwargs["stdin"] == server_module.subprocess.DEVNULL
        if os.name == "nt":
            assert kwargs["creationflags"] & server_module.subprocess.DETACHED_PROCESS
        else:
            assert kwargs["start_new_session"] is True
        assert (tmp_path / "data" / "jupyter.log").exists()


class TestStartEndpoint:
    def test_rejects_requests_without_the_header(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "start_jupyter", lambda: pytest.fail("must not start"))
        resp = app.request("POST", START)
        assert resp.status == 403
        assert json.loads(resp.body) == {"status": "forbidden"}

    @pytest.mark.parametrize("status", ["starting", "running"])
    def test_returns_the_start_status(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch, status: str
    ) -> None:
        monkeypatch.setattr(server_module, "start_jupyter", lambda: status)
        resp = app.request("POST", START, headers={"X-Lernapp": "1"})
        assert resp.status == 200
        assert json.loads(resp.body) == {"status": status}

    def test_missing_jupyterlab_names_the_python_to_install_into(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "start_jupyter", lambda: "missing")
        monkeypatch.setattr(server_module, "jupyter_python", lambda: "some-python")
        resp = app.request("POST", START, headers={"X-Lernapp": "1"})
        assert resp.status == 500
        assert json.loads(resp.body) == {"status": "missing", "python": "some-python"}


class TestJupyterProxy:
    def test_forwards_to_jupyter_with_its_own_host(self, app: App, upstream: Upstream) -> None:
        resp = app.request("GET", "/jupyter/api/status?token=t")
        assert resp.status == 200
        assert resp.body == b"jupyter-ok"
        head = upstream.requests[0]
        assert head.startswith("GET /jupyter/api/status?token=t HTTP/1.1")
        assert f"Host: 127.0.0.1:{upstream.port}" in head

    def test_answers_502_when_jupyter_is_not_running(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "JUPYTER_ADDR", ("127.0.0.1", 1))
        assert app.request("GET", "/jupyter/lab").status == 502
