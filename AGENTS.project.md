# AGENTS.project.md — lernapp-cas-ml

**Project-only.** Portable rules live in GLOBAL (`rotscher-baumi/GLOBAL`: `AGENTS.md`, `rules/`); this repository keeps no copy.

## Core rules

- **Plan first, then code:** for any non-trivial task, outline approach, alternatives and risks and wait for the user's OK before writing code.
- **Check before changing:** read existing code, conventions and the current state (`git status`, pull, re-read the file) before editing.
- **Keep course dates current:** when editing the course overview or upcoming appointments, verify dates and deadlines (including the transfer-work topic submission) against the latest authoritative timetable, show when the information was last checked, and update or remove entries that have changed or passed. Never guess dates.

## Purpose and stack

Self-made learning site for the CAS ML course (HSLU): explanations, diagrams, demos, in-browser Python exercises and self-test. Plain HTML/CSS/JavaScript without a build step; Skulpt (jsDelivr) runs the Python exercises; `server.py` is a small local server. Layout and how to add a chapter: `README.md`.

## Commands

- Dev: open `index.html` in the browser, or run `python server.py`
- Test / lint / build: none

## Fast Configuration

- Project focus: learning site; each chapter is one file in `modules/`
- Forbidden changes: adding a build step, bulk reformatting, copying course material (slides, instructor notebooks) into this repository (not freely distributable; keep the repository private)
- Test command: none (check in the browser, console without errors)
- Format command: none (follow the style of the surrounding files)
- Definition of Done: page loads without console errors, new chapter appears in navigation, no secrets or large files added