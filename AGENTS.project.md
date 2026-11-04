# AGENTS.project.md — lernapp-cas-ml

**Project-only.** Portable rules live in GLOBAL (`rotscher-baumi/GLOBAL`: `AGENTS.md`, `rules/`); this repository keeps no copy.

## Core rules

- **Plan first, then code:** for any non-trivial task, outline approach, alternatives and risks and wait for the user's OK before writing code.
- **Check before changing:** read existing code, conventions and the current state (`git status`, pull, re-read the file) before editing.
- **Workflow overview first:** a chapter's workflow overview («Der ganze Ablauf auf einen Blick», clickable figure) sits at the start of the chapter, right after the intro and before section 1.
- **Keep course dates current:** when editing the course overview or upcoming appointments, verify dates and deadlines (including the transfer-work topic submission) against the latest authoritative timetable, show when the information was last checked, and update or remove entries that have changed or passed. Never guess dates.

## Purpose and stack

Self-made learning site for the CAS ML course (HSLU): explanations, diagrams, demos and self-test, German and English, light and dark. Plain HTML/CSS/JavaScript without a build step; `server.py` is a small local server. Layout and how to add a chapter: `README.md`. Architecture, PlantUML diagrams and the data object model: `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/*.puml` (update them with every change to structure, flows or data objects).

## Python environment

Python 3.12 in the project's own `.venv/` (git-ignored); `server.py` starts JupyterLab from it. Setup, Windows: `py -3.12 -m venv .venv`, then `.venv\Scripts\python -m pip install -r requirements-dev.txt` (Linux/macOS: `python3 -m venv .venv`, `.venv/bin/python -m pip install -r requirements-dev.txt`). Run every command through the venv interpreter; the notebooks use its `python3` kernel. Runtime packages stay in `requirements.txt`, dev tools in `requirements-dev.txt`.

## Commands

- Dev: open `index.html` in the browser, or run `.venv\Scripts\python server.py`
- Lint: `.venv\Scripts\ruff check .` and `.venv\Scripts\ruff format --check server.py tools tests` (notebooks are not linted)
- Types: `.venv\Scripts\pyright`
- Tests: `.venv\Scripts\pytest` (about 15 s; includes the JS syntax check when Node.js is installed). `.venv\Scripts\pytest -m slow` runs every example notebook end to end (about two minutes, Titanic needs the internet without a local data file). Coverage: `.venv\Scripts\pytest --cov=server --cov=tools`
- Build: none (no build step)

## Tooling approval

2026-11-01: ruff, pytest, pytest-cov, pyright (and nbclient for the notebook test) approved as the Python baseline, per `rules/backend-python.md`. `AGENTS.md` §5 still applies to every other dependency.

## Data/ML notebooks

`rules/data-ml.md` applies to the example notebooks in `notebooks/beispiele/` as far as they teach with data: seeds are fixed (`SEED = 42`), scalers and selectors are fitted on the training part only, and every model result is shown next to a naive baseline with the sample size. Random splits are intentional on the course datasets (teaching i.i.d. train/test, cross-validation); a chronological split is shown where the topic is time series. Datasets are scikit-learn built-ins, generated data or the public Kaggle Titanic file; no schema checks, because no dataset is fetched or merged by the app.

## Fast Configuration

- Project focus: learning site; each chapter is one file in `modules/`
- Forbidden changes: adding a build step, bulk reformatting, copying course material (slides, instructor notebooks) into this repository (not freely distributable; keep the repository private)
- Test command: `.venv\Scripts\pytest`
- Format command: `.venv\Scripts\ruff format` on new or changed Python files only (no bulk reformatting); JS and notebooks follow the style of the surrounding files
- Definition of Done: ruff, pyright and pytest pass; page loads without console errors, new chapter appears in navigation, no secrets or large files added