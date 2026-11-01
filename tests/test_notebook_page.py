"""notebook.html: two modes (local Jupyter, Google Colab), no separate-tab link, list in step with the folder."""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest
from conftest import ROOT

PAGE = (ROOT / "notebook.html").read_text(encoding="utf-8")
HARNESS = ROOT / "tests" / "notebook_page_harness.js"
COLAB = "https://colab.research.google.com/github/rotscher-baumi/lernapp-cas-ml/blob/main/notebooks/"
STATUS = "/jupyter/api/status?token=lernapp-local"
needs_node = pytest.mark.skipif(shutil.which("node") is None, reason="Node.js is not installed")


def _run(**scenario: object) -> dict:
    """Run the page scripts in Node against a fake DOM.

    :param scenario: hostname, search, storage, jupyterUp, click and startResponse of the simulated visit.
    :return: what the page did, as reported by the harness.
    """
    scripts = re.findall(r"<script>(.*?)</script>", PAGE, re.S)[1:]  # the first one only sets the theme
    result = subprocess.run(
        ["node", str(HARNESS)],
        input=json.dumps({"scenario": scenario, "scripts": scripts, "hiddenIds": _hidden_ids()}),
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def _hidden_ids() -> list[str]:
    """Ids of the elements that carry the ``hidden`` attribute in the markup, i.e. start out hidden."""
    return [m.group(1) for m in re.finditer(r'<\w+[^>]*id="(\w+)"[^>]*\shidden[^>]*>', PAGE)]


def _listed() -> set[str]:
    return set(re.findall(r"\[\s*'([\w/]+\.ipynb)'", PAGE))


def test_has_no_separate_tab_link() -> None:
    assert 'id="nbopen"' not in PAGE
    assert "In eigenem Tab" not in PAGE


def test_lists_exactly_the_notebooks_in_the_folder() -> None:
    folder = ROOT / "notebooks"
    existing = {
        p.relative_to(folder).as_posix() for p in folder.rglob("*.ipynb") if ".ipynb_checkpoints" not in p.parts
    }
    assert _listed() == existing


def test_colab_base_matches_the_notebook_headers() -> None:
    assert f"var COLAB = '{COLAB}'" in PAGE


@needs_node
class TestHostedCopy:
    """A copy on static hosting has no server behind it: Colab only, and no calls to /jupyter/."""

    def test_offers_colab_only(self) -> None:
        page = _run(hostname="learnml.baum-berger.com", jupyterUp=False)
        assert page["paneColabHidden"] is False
        assert page["paneLocalHidden"] is True
        assert page["pressed"] == {"local": "false", "colab": "true"}
        assert page["localDisabled"] is True
        assert page["localTitle"]
        assert page["examples"] == 7
        assert page["others"] == 7
        assert page["firstLink"] == f"{COLAB}beispiele/01_Regression.ipynb"

    def test_never_talks_to_jupyter(self) -> None:
        assert _run(hostname="learnml.baum-berger.com", jupyterUp=True)["fetchCalls"] == []

    def test_ignores_a_stored_local_choice(self) -> None:
        page = _run(hostname="learnml.baum-berger.com", storage={"cas-ml-nbmode": "local"})
        assert page["pressed"]["colab"] == "true"
        assert page["fetchCalls"] == []

    def test_highlights_the_requested_notebook(self) -> None:
        page = _run(hostname="learnml.baum-berger.com", search="?nb=beispiele/07_Titanic.ipynb")
        assert page["pickHidden"] is False
        assert page["pickHref"] == f"{COLAB}beispiele/07_Titanic.ipynb"
        assert "Titanic" in page["pickText"]
        assert page["picked"] == 1

    def test_shows_no_pick_for_an_unknown_notebook(self) -> None:
        page = _run(hostname="learnml.baum-berger.com", search="?nb=nicht/vorhanden.ipynb")
        assert page["pickHidden"] is True
        assert page["picked"] == 0


@needs_node
class TestOwnComputer:
    def test_defaults_to_local_and_opens_jupyter(self) -> None:
        page = _run(hostname="localhost", jupyterUp=True)
        assert page["pressed"] == {"local": "true", "colab": "false"}
        assert page["paneLocalHidden"] is False
        assert page["localDisabled"] is False
        assert [c["url"] for c in page["fetchCalls"]] == [STATUS]
        assert page["frameSrc"] == "/jupyter/lab/tree/notebooks/Lernapp_Lernhilfe.ipynb?token=lernapp-local"
        assert page["frameHidden"] is False

    def test_opens_the_requested_notebook(self) -> None:
        page = _run(hostname="127.0.0.1", jupyterUp=True, search="?nb=beispiele/01_Regression.ipynb")
        assert page["frameSrc"] == "/jupyter/lab/tree/notebooks/beispiele/01_Regression.ipynb?token=lernapp-local"

    def test_remembers_the_colab_choice(self) -> None:
        page = _run(hostname="localhost", jupyterUp=True, storage={"cas-ml-nbmode": "colab"})
        assert page["pressed"]["colab"] == "true"
        assert page["fetchCalls"] == [], "Jupyter must not be probed while Colab mode is shown"

    def test_switching_to_colab_stores_the_choice(self) -> None:
        page = _run(hostname="localhost", jupyterUp=True, click="modeColab")
        assert page["pressed"]["colab"] == "true"
        assert page["storage"]["cas-ml-nbmode"] == "colab"

    def test_offers_to_start_jupyter_when_it_is_down(self) -> None:
        page = _run(hostname="localhost", jupyterUp=False)
        assert page["missHidden"] is False
        assert page["frameHidden"] is True

    def test_the_start_button_posts_with_the_app_header(self) -> None:
        page = _run(hostname="localhost", jupyterUp=False, click="nbstart")
        posts = [c for c in page["fetchCalls"] if c["method"] == "POST"]
        assert [(c["url"], c["headers"]) for c in posts] == [("/api/jupyter/start", {"X-Lernapp": "1"})]


def test_harness_exists() -> None:
    assert Path(HARNESS).exists()
