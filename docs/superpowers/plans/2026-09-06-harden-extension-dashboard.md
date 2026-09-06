# Extension Dashboard Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the public extension dashboard without adding runtime dependencies, while improving resilience, accessibility, deployment readiness, and regression coverage.

**Architecture:** Keep the single-page frontend and Python standard-library server. The server will expose only an explicit static allowlist, validate and cache the known Marketplace proxy requests, and expose `/healthz`; the frontend will validate responses, retain stale data with visible status, and implement modal focus management. Tests will use Python's standard library and Node syntax checks.

**Tech Stack:** Python 3.12 standard library, browser JavaScript, HTML/CSS, Docker Compose, GitHub Actions.

**Spec:** In-chat approved design from the preceding review conversation.

## Global Constraints

- No runtime dependencies or build step.
- Preserve the existing visual design and Marketplace API behavior.
- Do not edit the extension catalog content.
- Never serve `.git`, dotfiles, `.env`, backups, or arbitrary repository files.
- Return generic proxy errors to clients; keep detailed diagnostics server-side.
- Verify all changes with syntax checks, automated tests, HTTP smoke tests, and Compose validation before committing.

---

### Task 1: Harden the Python server

**Files:**
- Modify: `server.py`
- Create: `tests/test_server.py`

**Interfaces:**
- `GET /healthz` returns HTTP 200 and `{"status":"ok"}`.
- `POST /api/extensionquery` accepts JSON bodies up to 1 MiB and returns validated upstream JSON.
- Static requests only serve an explicit allowlist of public files.

- [ ] **Step 1: Write tests for sensitive-path blocking, health, body limit, and generic errors.**
- [ ] **Step 2: Run `python3 -m unittest -v` and verify the new tests fail.
- [ ] **Step 3: Add allowlisted static serving, `/healthz`, 1 MiB body validation, bounded cache, request coalescing, and generic error responses.
- [ ] **Step 4: Run the server test module and verify it passes.
- [ ] **Step 5: Commit the server hardening changes.

### Task 2: Harden frontend data flow and status handling

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- API parsing rejects malformed Marketplace responses with readable errors.
- `state` tracks `lastError`, `freshError`, and last successful fetch time.
- Existing data remains visible after refresh failure.

- [ ] **Step 1: Add fixture-oriented tests for response validation and filtering helpers.
- [ ] **Step 2: Implement validated parsing, stale-data status, fresh-category error state, and authoritative proxy behavior.
- [ ] **Step 3: Implement accessible modal focus entry/restoration and ARIA state.
- [ ] **Step 4: Run Node syntax checks and browser smoke checks.
- [ ] **Step 5: Commit the frontend resilience and accessibility changes.

### Task 3: Improve deployment and documentation

**Files:**
- Modify: `compose.yml`
- Modify: `README.md`
- Create: `.github/workflows/test.yml`

**Interfaces:**
- Compose includes a healthcheck against `/healthz`.
- CI runs Python tests, syntax checks, and Compose config validation.
- README documents the hardened deployment and corrected category count.

- [ ] **Step 1: Add the Compose healthcheck and use a documented immutable image reference strategy.
- [ ] **Step 2: Add CI workflow with standard-library checks and no package installation requirement.
- [ ] **Step 3: Correct README counts and operational notes.
- [ ] **Step 4: Validate Compose YAML and workflow contents.
- [ ] **Step 5: Commit deployment and documentation changes.

### Task 4: Full verification and final commit

**Files:**
- Verify: all modified and created files

- [ ] **Step 1: Run Python tests, syntax checks, HTTP smoke checks, and `docker compose config`.
- [ ] **Step 2: Confirm `git diff --check` and clean generated artifacts.
- [ ] **Step 3: Review the complete diff for scope and security regressions.
- [ ] **Step 4: Create the final Conventional Commit if prior commits were not used, or report all commits created.
