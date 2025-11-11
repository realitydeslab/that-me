# Repository Guidelines

## Project Structure & Module Organization
The repo currently holds only configuration (`CNAME`) and topline docs, so keep the root clean for GitHub Pages deployment from `main`. Place runnable simulation or agent code inside `src/` (for example, `src/agents/mirror_self/main.py`), keep shared utilities in `src/shared/`, and store prompts or assets under `assets/` with a short README. Mirror the structure under `tests/agents/...` to keep parity. Large datasets stay out of Git history; include a schema stub plus download instructions instead.

## Build, Test, and Development Commands
- `python3 -m venv .venv && source .venv/bin/activate` — standardize on a virtual environment before running any scripts.
- `pip install -r requirements.txt` — install the dependencies you declare; regenerate the file whenever versions change.
- `pytest` — execute the mirrored test suite; use `pytest -k agent_name` for focused debugging.
- `python3 -m http.server 4173` — quick preview of static artifacts from the repo root, matching what GitHub Pages will serve.
Document any extra toolchain (npm, Makefile, justfile, etc.) inside `README.md` and add a brief note here before depending on it.

## Coding Style & Naming Conventions
Follow PEP 8 with 4-space indentation for Python modules and 2 spaces for YAML/JSON. Package names stay lowercase with underscores (`mirror_self`), classes follow CapWords, and functions or variables use snake_case verbs. Run `ruff` or `flake8` locally before opening a PR and commit formatter configs alongside any new languages you introduce.

## Testing Guidelines
Each feature or agent requires at least one `tests/<area>/test_<module>.py` that covers success and failure paths. Use descriptive names (e.g., `test_identity_agent_handles_missing_memory`), add fixtures for deterministic responses, and mark external calls with `@pytest.mark.integration`. Target 80% statement coverage and describe any intentional gaps plus mitigation in the PR.

## Commit & Pull Request Guidelines
Existing history favors short, imperative summaries (“Create README.md”), so keep that style and wrap messages at 72 characters. Group related work per commit. Pull requests must list the purpose, testing notes, linked issue or TODO, and screenshots or log excerpts when you touch front-end output; convert drafts only after lint/test commands pass locally.

## Security & Configuration Tips
Coordinate before editing `CNAME`; incorrect entries take the site offline. Keep secrets out of the repo and load them from user-specific `.env.local` files ignored by Git. Strip PII from datasets or prompts and document privacy considerations in `README.md`.
