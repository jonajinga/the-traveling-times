# The Traveling Times

Isabelle's creative journal exploring travel, poetry, art, fashion, music, dance, and entertainment.

Built with [Eleventy (11ty)](https://www.11ty.dev/) and hosted on [Cloudflare Pages](https://pages.cloudflare.com/).

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Install

```bash
npm install
```

### Develop locally

```bash
npm start
```

Opens at `http://localhost:8080` with live reload.

### Build for production

```bash
npm run build
```

Output goes to `_site/`.

---

## Project Structure

```
src/
├── _data/          # site.json (globals), authors.json (author registry)
├── _includes/
│   ├── layouts/    # base, article, section, home, author, tag
│   └── partials/   # header, footer, article-card, subscribe
├── assets/
│   ├── css/        # tokens, base, layout, components, article, main
│   └── js/         # theme toggle, reading progress, search, etc.
├── content/
│   ├── travel/
│   ├── poetry/
│   ├── entertainment/
│   ├── fashion/
│   ├── art/
│   ├── music/
│   └── dance/
└── pages/          # about, archives, newsletter, submit, privacy, topics, etc.
```

---

## Writing Articles

Create a Markdown file in the appropriate section folder. Frontmatter template:

```yaml
---
layout: article
title: "Your Article Title"
description: "A one or two sentence summary for cards and meta tags."
section: Travel        # Must match a section key exactly
author: isabelle       # Must match a key in authors.json
authorName: Isabelle
date: 2026-03-17
tags:
  - tag-one
  - tag-two
featured: true         # Optional — promotes to front page hero
draft: true            # Optional — excludes from all collections
---
```

---

## Deployment to Cloudflare Pages

1. Push this repo to GitHub
2. In Cloudflare Pages, connect the repo
3. Set build command: `npm run build`
4. Set output directory: `_site`
5. Set Node.js version environment variable: `NODE_VERSION = 18`

Cloudflare will build and deploy on every push to main.

---

## Customisation

All visual variables — colors, fonts, spacing, dark mode palette — live in `src/assets/css/tokens.css`. Edit that file to retheme the entire site.

Site globals (title, description, nav, section colors) live in `src/_data/site.json`.
