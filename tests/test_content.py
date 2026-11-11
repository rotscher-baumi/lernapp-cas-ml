"""Content checks: notebooks are valid and portable, the overview links to existing notebooks, JS parses."""

import re
import shutil
import subprocess
import sys
from pathlib import Path

import nbformat
import pytest
from conftest import ROOT

NOTEBOOK_DIR = ROOT / "notebooks"
ALL_NOTEBOOKS = sorted(p for p in NOTEBOOK_DIR.rglob("*.ipynb") if ".ipynb_checkpoints" not in p.parts)
EXAMPLES = sorted((NOTEBOOK_DIR / "beispiele").glob("*.ipynb"))
COLAB = "https://colab.research.google.com/github/rotscher-baumi/lernapp-cas-ml/blob/main/notebooks/"


def _id(path: Path) -> str:
    return str(path.relative_to(NOTEBOOK_DIR))


def _read(path: Path) -> nbformat.NotebookNode:
    return nbformat.read(path, as_version=4)


def test_there_are_example_notebooks() -> None:
    assert len(EXAMPLES) == 8


@pytest.mark.parametrize("path", ALL_NOTEBOOKS, ids=_id)
def test_notebook_is_valid(path: Path) -> None:
    nbformat.validate(_read(path))


@pytest.mark.parametrize("path", ALL_NOTEBOOKS, ids=_id)
def test_notebook_uses_the_portable_kernel(path: Path) -> None:
    """Kernels such as ``cas-ml`` exist on one PC only; ``python3`` is in every environment."""
    assert _read(path).metadata.kernelspec.name == "python3"


@pytest.mark.parametrize("path", EXAMPLES, ids=_id)
def test_example_ships_without_outputs(path: Path) -> None:
    for cell in _read(path).cells:
        if cell.cell_type == "code":
            assert not cell.outputs, f"{path.name}: clear outputs before committing"


@pytest.mark.parametrize("path", EXAMPLES, ids=_id)
def test_example_names_its_origin_and_offers_colab(path: Path) -> None:
    first = _read(path).cells[0].source
    assert "kein HSLU-Kursmaterial" in first
    assert f"{COLAB}beispiele/{path.name}" in first


@pytest.mark.parametrize("path", EXAMPLES, ids=_id)
def test_example_links_to_existing_notebooks(path: Path) -> None:
    for cell in _read(path).cells:
        if cell.cell_type == "markdown":
            for target in re.findall(r"\]\((\.\./[^)]+\.ipynb)\)", cell.source):
                assert (path.parent / target).resolve().exists(), f"{path.name}: {target} does not exist"


def test_overview_links_only_to_existing_notebooks() -> None:
    source = (ROOT / "modules" / "uebersicht.js").read_text(encoding="utf-8")
    names = set(re.findall(r"bsp\('(\w+)'\)|NB = '(\w+)'|beispiele/(\w+)\.ipynb", source))
    flat = {n for group in names for n in group if n}
    assert flat, "the overview no longer links to example notebooks"
    for name in flat:
        assert (NOTEBOOK_DIR / "beispiele" / f"{name}.ipynb").exists(), f"overview links to missing {name}"


def test_exercise_data_is_up_to_date() -> None:
    result = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "build_notebook_exercises.py"), "--check"],
        capture_output=True,
        text=True,
        cwd=ROOT,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr


@pytest.mark.skipif(shutil.which("node") is None, reason="Node.js is not installed")
@pytest.mark.parametrize(
    "path",
    sorted([*(ROOT / "modules").rglob("*.js"), *(ROOT / "assets").glob("*.js")]),
    ids=lambda p: str(p.relative_to(ROOT)),
)
def test_javascript_parses(path: Path) -> None:
    result = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True, check=False)
    assert result.returncode == 0, result.stderr


@pytest.mark.slow
@pytest.mark.parametrize("path", EXAMPLES, ids=_id)
def test_example_runs_end_to_end(path: Path) -> None:
    """Execute the notebook in a kernel of this environment (Titanic needs the internet without a local data file)."""
    from nbclient import NotebookClient

    notebook = _read(path)
    NotebookClient(
        notebook, kernel_name="python3", timeout=900, resources={"metadata": {"path": str(path.parent)}}
    ).execute()
    errors = [o for c in notebook.cells if c.cell_type == "code" for o in c.outputs if o.output_type == "error"]
    assert not errors
