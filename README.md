# Trivia

This repository contains a Vite + React SPA for a Trivia game.

## Features

*   Fetches trivia questions from the Open Trivia Database API.
*   In-browser database for players and game history using `sql.js`.
*   Game board with multiple categories.
*   Animations and transitions for a more engaging user experience.
*   Users can select the number of categories to play with.
*   State management using `useReducer`.

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

## CI / Automatic builds (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml` to build and push a Docker image when commits are pushed to the `main` branch.

To enable it:

1.  Add the following repository secrets in GitHub:
    *   `DOCKERHUB_USERNAME` — your Docker Hub username
    *   `DOCKERHUB_TOKEN` — Docker Hub access token or password
    *   (optional) `GHCR_USERNAME` — your GitHub/Org user for GHCR
    *   (optional) `GHCR_TOKEN` — a personal access token with `write:packages` and `read:packages` for GHCR
2.  The workflow will push tags for any registry secrets you configure. It supports Docker Hub and GHCR.