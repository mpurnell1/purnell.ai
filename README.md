# purnell.ai

Source for [purnell.ai](https://purnell.ai), my personal site.

Static HTML + CSS, no build step. Served locally with [Caddy](https://caddyserver.com), deployed to [GitHub Pages](https://pages.github.com) via GitHub Actions on push to `main`.

## Layout

```
site/              # web root
  index.html       # landing page
  articles/        # reading list
  css/site.css     # shared styles
  resume.pdf       # linked from the landing page
  CNAME            # custom domain for GitHub Pages
.github/workflows/pages.yml  # deploys site/ to Pages
Caddyfile          # local dev config
```

## Local dev

```
caddy run
```

Serves `site/` at http://localhost:8080.

## Deploy

Push to `main`. The Pages workflow uploads `site/` as the artifact and publishes it.

## Eventual home

Intended to eventually live on a Raspberry Pi Zero 2 W, using the same `site/` directory as Caddy's web root.
