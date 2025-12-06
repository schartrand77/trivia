# Trivia

This repository contains a Vite + React SPA for a Trivia game.

## Features

*   Fetches trivia questions from the Open Trivia Database API.
*   In-browser database for players and game history using `sql.js`.
*   Game board with multiple categories.
*   Animations and transitions for a more engaging user experience.
*   Users can select the number of categories to play with.
*   State management using `useReducer`.
*   Admin login wall protects the SPA (credentials pulled from `VITE_ADMIN_USERNAME`/`VITE_ADMIN_PASSWORD`).

## Admin login

The entire application is behind a lightweight admin gate. Credentials can be set at runtime via the `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD` environment variables. During local development, add them to your `.env` (Vite will pick them up automatically). When running the Docker image or deploying on Unraid, set the same variables in the container configuration and restart; the bundled `/env-config.js` is rewritten on startup so no rebuild is required.

```bash
# Development .env
VITE_ADMIN_USERNAME=youradmin
VITE_ADMIN_PASSWORD=super-secret

# Docker / Unraid
docker run -e VITE_ADMIN_USERNAME=youradmin -e VITE_ADMIN_PASSWORD=super-secret -p 8080:80 yourname/trivia:latest
```

Defaults are `admin / trivia` if nothing is provided. The login screen appears on every fresh load; use the lock icon in the header to sign out manually at any time.

## Local development

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Start dev server:

    ```bash
    npm run dev
    ```

3.  Build production bundle:

    ```bash
    npm run build
    ```

## Docker

The project includes a `Dockerfile` to build a production image using nginx.

-   Build locally: `docker build -t yourname/trivia:latest .`
-   Run locally: `docker run -p 8080:80 yourname/trivia:latest`
-   Or use `docker-compose up --build` to run with `docker-compose.yml` (binds to host port `8080`).
-   `docker-compose.yml` forwards `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD` from your `.env`, so update that file before running Compose.

> **Note:** Set `VITE_ADMIN_USERNAME`/`VITE_ADMIN_PASSWORD` in your `.env` for development, or pass them as container environment variables in production. The Docker image writes `/usr/share/nginx/html/env-config.js` on startup, so updating the environment and restarting the container is enough to change credentials.

## CI / Automatic builds (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml` to build and push a Docker image when commits are pushed to the `main` branch.

To enable it:

1.  Add the following repository secrets in GitHub:
    *   `DOCKERHUB_USERNAME` — your Docker Hub username
    *   `DOCKERHUB_TOKEN` — Docker Hub access token or password
    *   (optional) `GHCR_USERNAME` — your GitHub/Org user for GHCR
    *   (optional) `GHCR_TOKEN` — a personal access token with `write:packages` and `read:packages` for GHCR
2.  The workflow will push tags for any registry secrets you configure. It supports Docker Hub and GHCR.
