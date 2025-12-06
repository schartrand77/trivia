# Trivia — Unraid install & CI

This repository contains a Vite + React SPA, Docker build files, a Community Applications template starter, and a CI workflow to automatically build and push images.

Quick summary

- Build locally: `docker build -t yourname/trivia:latest .`
- Run locally: `docker run -p 8080:80 yourname/trivia:latest`
- Or use `docker-compose up --build` to run with `docker-compose.yml` (binds to host port `8080`).
- Admin gate baked in via `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD`.

Tailwind integration

- Tailwind is integrated into the Vite build via PostCSS. Styles live in `src/index.css` and are processed during `npm run build`.

Local development

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Build production bundle (Tailwind processed automatically):

```bash
npm run build
```

Admin login
-----------

The SPA is now protected by an admin login screen. Credentials are injected at build time via the Vite env vars (defaults to `admin / trivia`):

```bash
VITE_ADMIN_USERNAME=myadmin
VITE_ADMIN_PASSWORD=supersecret
```

Update your `.env` / `.env.production` before running `npm run build`, `docker build`, or CI so the compiled bundle includes your custom credentials. Once logged in you can lock the app again with the header icon or by clearing browser storage.

Docker / Unraid

1) Build and push to a registry (recommended)

```bash
docker build -t yourdockerhubusername/trivia:latest .
docker push yourdockerhubusername/trivia:latest
```

Then add the image in Unraid (Community Applications) and map host port `8080` → container port `80` (or adjust as needed). Make sure `.env` defines `VITE_ADMIN_USERNAME`/`VITE_ADMIN_PASSWORD` before you build so the login matches the credentials you intend to use.

2) Build on Unraid host

Copy the repo to an Unraid share, SSH into the host and run:

```bash
docker build -t local/trivia:latest /path/to/repo
docker run -d --name trivia -p 8080:80 local/trivia:latest
```

3) Community Applications template

Use `unraid-community-templates/trivia.xml` as a starter. Replace `__DOCKER_REPO__` with your repository (for example `yourname/trivia:latest`) before importing or submitting.

CI / Automatic builds (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml` to build and push a Docker image when commits are pushed to the `main` branch.

To enable it:

1. Add the following repository secrets in GitHub:
   - `DOCKERHUB_USERNAME` — your Docker Hub username
   - `DOCKERHUB_TOKEN` — Docker Hub access token or password

2. The workflow will push two tags:
   - `<username>/trivia:latest`
   - `<username>/trivia:<commit-sha>`

Updating the Unraid template & CI

- The template file `unraid-community-templates/trivia.xml` is a starter — edit `<Repository>` to point to your image and set ports/env as you prefer.
- If you'd like, I can add a more full-featured template with optional bind mounts and advanced runtime options.

Next steps I can take for you

- Build and push a Docker image to Docker Hub (I will need your Docker Hub username and token, or you can set the GitHub secrets and let CI do it).
- Create a more advanced Community Applications template with sample mappings and optional env variables pre-filled.
- Add GitHub Actions to push images to GHCR instead of Docker Hub (if you prefer using GHCR).
