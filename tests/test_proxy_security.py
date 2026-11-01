"""The Jupyter proxy and the start endpoint must not be reachable from other web sites.

JupyterLab runs with a fixed token and the proxy rewrites Origin and Host for it, so without checks in the proxy a
page on any web site could open a WebSocket to a running kernel (CSRF / WebSocket hijacking), and a rebinding
domain pointing at 127.0.0.1 could do the same as a "same-origin" page (DNS rebinding).
"""

from types import ModuleType

import pytest
from conftest import App, Upstream

STATUS = "/jupyter/api/status?token=lernapp-local"
WEBSOCKET = {"Connection": "Upgrade", "Upgrade": "websocket", "Sec-WebSocket-Version": "13", "Sec-WebSocket-Key": "x"}


@pytest.fixture(autouse=True)
def loopback_binding(server_module: ModuleType, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(server_module, "HOST", "127.0.0.1")
    monkeypatch.setattr(server_module, "ALLOWED_HOSTS", {"localhost", "127.0.0.1", "::1"})


def own_host(app: App) -> str:
    return f"{app.host}:{app.port}"


class TestForeignOrigin:
    @pytest.mark.parametrize("origin", ["https://evil.example", "http://localhost:9999", "null", "http://127.0.0.1"])
    def test_blocks_fetch_from_another_origin(self, app: App, upstream: Upstream, origin: str) -> None:
        assert app.request("GET", STATUS, headers={"Origin": origin}).status == 403
        assert upstream.requests == [], "the request must not reach JupyterLab"

    def test_blocks_websocket_from_another_origin(self, app: App, upstream: Upstream) -> None:
        resp = app.request(
            "GET", "/jupyter/api/kernels/k/channels", headers={**WEBSOCKET, "Origin": "https://evil.example"}
        )
        assert resp.status == 403
        assert upstream.requests == []

    def test_blocks_state_changing_request_from_another_origin(self, app: App, upstream: Upstream) -> None:
        resp = app.request("POST", "/jupyter/api/kernels", b"{}", headers={"Origin": "https://evil.example"})
        assert resp.status == 403
        assert upstream.requests == []

    def test_allows_the_pages_own_origin(self, app: App, upstream: Upstream) -> None:
        resp = app.request("GET", STATUS, headers={"Origin": f"http://{own_host(app)}"})
        assert resp.status == 200
        assert resp.body == b"jupyter-ok"

    def test_allows_requests_without_origin(self, app: App, upstream: Upstream) -> None:
        """Navigations and command line tools send no Origin."""
        assert app.request("GET", STATUS).status == 200


class TestFetchMetadata:
    @pytest.mark.parametrize("site", ["cross-site", "same-site"])
    def test_blocks_requests_from_other_sites(self, app: App, upstream: Upstream, site: str) -> None:
        """A cross-site link or image sends no Origin on GET, but browsers add Sec-Fetch-Site."""
        assert app.request("GET", STATUS, headers={"Sec-Fetch-Site": site}).status == 403
        assert upstream.requests == []

    @pytest.mark.parametrize("site", ["same-origin", "none"])
    def test_allows_own_pages_and_typed_addresses(self, app: App, upstream: Upstream, site: str) -> None:
        assert app.request("GET", STATUS, headers={"Sec-Fetch-Site": site}).status == 200


class TestDnsRebinding:
    def test_blocks_a_foreign_host_name(self, app: App, upstream: Upstream) -> None:
        """A domain rebound to 127.0.0.1 makes the attacker's page same-origin; only the Host name gives it away."""
        evil = "rebound.example:8765"
        resp = app.request("GET", STATUS, headers={"Host": evil, "Origin": f"http://{evil}"})
        assert resp.status == 403
        assert upstream.requests == []

    @pytest.mark.parametrize("host", ["localhost:8765", "127.0.0.1:8765", "[::1]:8765", "LOCALHOST:8765", "localhost"])
    def test_allows_loopback_names(self, app: App, upstream: Upstream, host: str) -> None:
        assert app.request("GET", STATUS, headers={"Host": host, "Origin": f"http://{host}"}).status == 200

    def test_allows_names_added_through_the_environment(
        self, app: App, upstream: Upstream, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "ALLOWED_HOSTS", {"localhost", "lernapp.lan"})
        assert app.request("GET", STATUS, headers={"Host": "lernapp.lan:8765"}).status == 200

    def test_does_not_check_names_when_listening_on_the_network(
        self, app: App, upstream: Upstream, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """A deployment under HOST=0.0.0.0 has names we cannot know; Origin and Sec-Fetch-Site still apply."""
        monkeypatch.setattr(server_module, "HOST", "0.0.0.0")
        host = "lernapp.example.org"
        assert app.request("GET", STATUS, headers={"Host": host, "Origin": f"https://{host}"}).status == 200
        assert app.request("GET", STATUS, headers={"Host": host, "Origin": "https://evil.example"}).status == 403


class TestStartEndpoint:
    HEADER = {"X-Lernapp": "1"}

    def test_blocks_a_foreign_origin_even_with_the_header(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "start_jupyter", lambda: pytest.fail("must not start"))
        resp = app.request("POST", "/api/jupyter/start", headers={**self.HEADER, "Origin": "https://evil.example"})
        assert resp.status == 403

    def test_blocks_a_foreign_host_name(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "start_jupyter", lambda: pytest.fail("must not start"))
        resp = app.request("POST", "/api/jupyter/start", headers={**self.HEADER, "Host": "rebound.example:8765"})
        assert resp.status == 403

    def test_still_starts_for_the_own_page(
        self, app: App, server_module: ModuleType, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(server_module, "start_jupyter", lambda: "starting")
        headers = {**self.HEADER, "Origin": f"http://{own_host(app)}", "Sec-Fetch-Site": "same-origin"}
        assert app.request("POST", "/api/jupyter/start", headers=headers).status == 200
