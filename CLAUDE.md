# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Jekyll Build & Serve
```bash
# Local development with Docker (recommended)
docker build -t jekyll-local .
docker run -it -v $(pwd):/jekyll -p 4000:4000 jekyll-local

# Alternative: Direct Jekyll commands (requires Ruby environment)
bundle install
bundle exec jekyll serve --incremental --host 0.0.0.0
```

### Asset Building
```bash
# Build JavaScript (uses Rollup with Babel)
npm run js

# Build CSS (uses Stylus preprocessor)
npm run css

# Build all assets (JS + CSS)
npm run assets
```

## Architecture Overview

This is a Jekyll-based personal blog with a hybrid build system combining Ruby (Jekyll) and Node.js (for asset compilation).

### Content Structure
- **_posts/**: Blog posts following Jekyll convention (YYYY-MM-DD-title.md)
- **_drafts/**: Unpublished posts
- **_layouts/**: Two layouts - `default.html` (listings) and `post.html` (individual posts)
- **_includes/**: Reusable components (header, footer, search, pagination)

### Build Pipeline
1. **Jekyll**: Handles content generation, templating, and site structure
2. **Node.js**: Manages JavaScript and CSS compilation
   - JavaScript: Rollup + Babel (ES6+ → ES5, minification)
   - CSS: Stylus → compressed CSS with source maps
   - Output: `dist/` directory

### Key Configurations
- **_config.yml**: Jekyll settings, pagination (12 posts/page), plugins
- **CDN**: Images served from `cdn-lc.annatarhe.cn`
- **Comments**: Disqus integration
- **Search**: Custom JavaScript implementation in `src/scripts/`

### Deployment
- Configured for GitHub Pages
- Uses Chinese Ruby gems mirror for faster builds
- Docker environment for consistent local development

## Commit Rules

Follow Conventional Commits with scope and module:
```
fix(home): add price link on home page
feat(ai): add AI module
refactor(cell): update cell module for better maintenance
perf(parser): improve parser performance by over 30%
```