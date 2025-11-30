# Trivia — Unraid install & CI

This repository contains a Vite + React SPA, Docker build files, a Community Applications template starter, and a CI workflow to automatically build and push images.

Quick summary

- Build locally: `docker build -t yourname/trivia:latest .`
- Run locally: `docker run -p 8080:80 yourname/trivia:latest`
- Or use `docker-compose up --build` to run with `docker-compose.yml` (binds to host port `8080`).

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

Docker / Unraid

1) Build and push to a registry (recommended)

```bash
docker build -t yourdockerhubusername/trivia:latest .
docker push yourdockerhubusername/trivia:latest
```

Then add the image in Unraid (Community Applications) and map host port `8080` → container port `80` (or adjust as needed).

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
   - (optional) `GHCR_USERNAME` — your GitHub/Org user for GHCR
   - (optional) `GHCR_TOKEN` — a personal access token with `write:packages` and `read:packages` for GHCR

2. The workflow will push tags for any registry secrets you configure. It supports Docker Hub and GHCR.

Updating the Unraid template & CI

- The template file `unraid-community-templates/trivia.xml` is a starter — edit `<Repository>` to point to your image and set ports/env as you prefer.
- If you'd like, I can add a more full-featured template with optional bind mounts and advanced runtime options.

Next steps I can take for you

- Build and push a Docker image to Docker Hub (I will need your Docker Hub username and token, or you can set the GitHub secrets and let CI do it).
- Create a more advanced Community Applications template with sample mappings and optional env variables pre-filled.
- Switch CI to push exclusively to GHCR or another registry if you prefer.
# Trivia — Unraid install instructions

This repository now contains a minimal Vite + React scaffold and Docker setup so you can run the app on Unraid.

Quick summary:

- Build locally: `docker build -t yourname/trivia:latest .`
- Run locally: `docker run -p 8080:80 yourname/trivia:latest`
- Or use `docker-compose up --build` to run with `docker-compose.yml` (binds to host port `8080`).

Unraid installation options

1) Build and push to a registry (recommended)

  - Build and tag the image:

```bash
docker build -t yourdockerhubusername/trivia:latest .
docker push yourdockerhubusername/trivia:latest
```

  - In Unraid, install the Community Applications plugin and add a new container using the image `yourdockerhubusername/trivia:latest`.
  - Map host port `8080` to container port `80` (or change as desired).

2) Build on Unraid host (if you prefer not to push)

  - Copy the repository to an Unraid share or make it available on the Unraid host.
  - SSH into Unraid and from the project directory run:

```bash
docker build -t local/trivia:latest .
docker run -d --name trivia -p 8080:80 local/trivia:latest
```

3) Use the provided Community Applications template (example)

  - The file `unraid-community-templates/trivia.xml` is a minimal example you can adapt and submit to your private template repo or the Community Applications repo. Edit fields like `<author>` and `<website>` before use.

Notes

- The app uses Tailwind via CDN for quick styling. For production you may want to integrate Tailwind properly.
- The `docker-compose.yml` is included for convenience; Unraid users can use `docker-compose` if supported on their setup, or follow the image-based steps above.

Next steps I can do for you

- Build and push a Docker image to Docker Hub (needs your credentials and image name).
- Create a fuller Unraid XML template with environment variables and advanced mappings.
- Add CI to automatically build and push images.
