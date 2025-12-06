# Trivia — Unraid install & CI

This repository contains a Vite + React SPA, Docker build files, a Community Applications template starter, and a CI workflow to automatically build and push images.

Quick summary

- Build locally: `docker build -t yourname/trivia:latest .`
- Run locally: `docker run -p 8080:80 yourname/trivia:latest`
- Or use `docker-compose up --build` to run with `docker-compose.yml` (binds to host port `8080`).
- Admin gate controlled via `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD`.
- When using `docker-compose.yml`, credentials are pulled from your `.env`, so change `VITE_ADMIN_*` there before running Compose.
- Installable PWA (a manifest + icons are included so you can add the app to mobile home screens).

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

The SPA is protected by an admin login screen. Credentials are resolved in this order:

1. `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD` environment variables injected into `/env-config.js` when the container starts.
2. Vite env vars from `.env` (for the dev server).
3. Built-in defaults of `admin / trivia`.

For local dev, add the variables to `.env`. For Docker/Unraid deployments, set the environment variables when you run the container (no rebuild required because the entrypoint rewrites `/usr/share/nginx/html/env-config.js` on boot).

```bash
# docker run example
docker run -d \
  -e VITE_ADMIN_USERNAME=myadmin \
  -e VITE_ADMIN_PASSWORD=supersecret \
  -p 8080:80 yourname/trivia:latest
```

Once logged in you can lock the app again with the header icon or by clearing browser storage.

Docker / Unraid

1) Build and push to a registry (recommended)

```bash
docker build -t yourdockerhubusername/trivia:latest .
docker push yourdockerhubusername/trivia:latest
```

Then add the image in Unraid (Community Applications) and map host port `8080` → container port `80` (or adjust as needed). Set `VITE_ADMIN_USERNAME`/`VITE_ADMIN_PASSWORD` as container environment variables in the template so the login matches the credentials you intend to use (no image rebuild necessary).

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
