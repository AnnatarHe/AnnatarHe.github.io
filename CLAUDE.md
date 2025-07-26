# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Astro Build & Serve
```bash
# Install dependencies
npm install

# Local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run astro check
```

### Legacy Jekyll Commands (Deprecated)
The site has been migrated from Jekyll to Astro. The following commands are no longer needed:
```bash
# OLD: Jekyll commands (no longer used)
# bundle install
# bundle exec jekyll serve
# npm run js && npm run css
```

## Architecture Overview

This is an **Astro-based personal blog** with modern web technologies and static site generation.

### Content Structure
- **src/content/posts/**: Blog posts in MDX format (YYYY-MM-DD-title.mdx)
- **src/pages/**: Astro pages (index.astro, posts.astro, about.astro, posts/[...slug].astro)
- **src/layouts/**: Layout components (Layout.astro for HTML structure)
- **src/components/**: Reusable components (Header.astro, Footer.astro, PageLayout.astro)

### Technology Stack
- **Framework**: Astro 4.15+ (Static Site Generator)
- **Styling**: Tailwind CSS 3.4+ with custom theme
- **Content**: MDX with frontmatter-based metadata
- **UI Components**: Astro components with React integration
- **TypeScript**: Full TypeScript support

### Build Pipeline
1. **Astro**: Handles static site generation, content collections, and page routing
2. **Tailwind CSS**: Processes utility-first CSS with dark theme support
3. **MDX**: Compiles markdown with JSX components for rich content
4. **TypeScript**: Provides type safety across components and content
5. **Output**: Static files optimized for GitHub Pages deployment

### Key Features
- **Dark Theme**: Teal accent color (#2eb8b8) with dark background
- **Responsive Design**: Mobile-first with sticky navigation
- **Content Collections**: Type-safe blog post management
- **GitHub Pages**: Automated deployment via GitHub Actions
- **SEO Optimized**: Meta tags, OpenGraph, Twitter cards, sitemap
- **Performance**: Static generation with minimal JavaScript

### Configuration Files
- **astro.config.mjs**: Astro configuration with integrations
- **tailwind.config.mjs**: Tailwind CSS customization
- **tsconfig.json**: TypeScript configuration
- **src/content/config.ts**: Content collections schema
- **.github/workflows/deploy.yml**: GitHub Pages deployment

### Deployment
- **Platform**: GitHub Pages with GitHub Actions
- **Build Process**: Automated on push to master branch
- **Static Output**: All files pre-rendered for optimal performance
- **CDN**: GitHub Pages CDN with global distribution

### Migration Notes
- **From**: Jekyll-based blog with Ruby/Stylus build system
- **To**: Astro-based blog with modern JavaScript ecosystem
- **Content**: Jekyll posts converted to MDX with proper frontmatter
- **UI**: Redesigned to match AsyncTalk website aesthetic
- **Performance**: Significantly improved with static generation

## Content Management

### Blog Posts
All blog posts are stored in `src/content/posts/` as MDX files with the following frontmatter structure:

```yaml
---
title: "Post Title"
layout: post
tags: tag1 tag2 tag3
date: 2024-01-01
draft: false
---
```

### Adding New Posts
1. Create a new `.mdx` file in `src/content/posts/`
2. Use the filename format: `YYYY-MM-DD-title-slug.mdx`
3. Add proper frontmatter with title, tags, and date
4. Write content using Markdown with optional JSX components

## Commit Rules

Follow Conventional Commits with scope and module:
```
feat(astro): migrate from Jekyll to Astro
fix(ui): correct responsive navigation on mobile
docs(readme): update development instructions
perf(build): optimize image loading and bundling
```

## Important Notes

- **Legacy Files**: Old Jekyll files (`_posts/`, `_layouts/`, etc.) are preserved for reference during migration
- **Images**: Continue using CDN at `cdn-lc.annatarhe.cn` for existing images
- **Search**: Search functionality will be implemented in a future update
- **Comments**: Disqus integration maintained in post layout
- **Analytics**: Should be configured in the Layout.astro component if needed