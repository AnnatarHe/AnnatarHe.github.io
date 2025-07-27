# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Manager
This project uses **pnpm** as the package manager. Use pnpm for all dependency management.

### Astro Build & Serve
```bash
# Install dependencies
pnpm install

# Local development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type checking
pnpm run astro check
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
- **Framework**: Astro 5.12+ (Static Site Generator)
- **Styling**: Tailwind CSS 4.1+ with Vite plugin and custom theme
- **Content**: MDX with frontmatter-based metadata
- **UI Components**: Astro components with React integration
- **Icons**: Lucide React for consistent iconography
- **TypeScript**: Full TypeScript support
- **Font**: Lato as default font family

### Build Pipeline
1. **Astro**: Handles static site generation, content collections, and page routing
2. **Tailwind CSS**: Processes utility-first CSS with dark theme support
3. **MDX**: Compiles markdown with JSX components for rich content
4. **TypeScript**: Provides type safety across components and content
5. **Output**: Static files optimized for GitHub Pages deployment

### Key Features
- **Dark Theme**: Teal accent color (#2eb8b8) with dark background
- **Minimalist Design**: Clean, centered layout focusing on content
- **Responsive Design**: Mobile-first with elegant typography
- **Content Collections**: Type-safe blog post management
- **GitHub Pages**: Automated deployment via GitHub Actions
- **SEO Optimized**: Meta tags, OpenGraph, Twitter cards, sitemap
- **Performance**: Static generation with minimal JavaScript
- **Contact Info**: Email (annatar.he@gmail.com) and personal website (https://i.annatarhe.com/)

### Configuration Files
- **astro.config.mjs**: Astro configuration with integrations
- **src/styles/global.css**: Tailwind CSS v4 configuration with custom font families
- **tsconfig.json**: TypeScript configuration
- **src/content/config.ts**: Content collections schema
- **.github/workflows/deploy.yml**: GitHub Pages deployment
- **package.json**: Dependencies including lucide-react for icons

### Deployment
- **Platform**: GitHub Pages with GitHub Actions
- **Build Process**: Automated on push to master branch
- **Static Output**: All files pre-rendered for optimal performance
- **CDN**: GitHub Pages CDN with global distribution

### Migration Notes
- **From**: Jekyll-based blog with Ruby/Stylus build system
- **To**: Astro-based blog with modern JavaScript ecosystem
- **Content**: Jekyll posts converted to MDX with proper frontmatter
- **UI**: Minimalist design with focus on readability and personal branding
- **Performance**: Significantly improved with static generation
- **Recent Updates**: 
  - Homepage redesigned with centered, minimalist layout
  - Added lucide-react icons throughout the site
  - Updated to Tailwind CSS v4 with Vite plugin
  - Email updated to annatar.he@gmail.com

## UI Components & Styling

### Font Configuration
- **Default Font**: Lato (for all English content)
- **Chinese Font**: LXGW WenKai
- **Font Families**: Configured in `src/styles/global.css` using Tailwind CSS v4 theme

### Icons
Using lucide-react for consistent iconography:
- **Navigation**: GitHub, Globe (Website), Mail, User (About)
- **Content**: FileText (Recent Writings), ArrowRight (View all posts)
- **Footer**: GitHub, Globe, Mail, Rss

### Color Scheme
- **Background**: Pure black (#000000)
- **Text**: White with gray variations
- **Accent**: Teal (#2eb8b8 / teal-400)
- **Hover Effects**: Smooth transitions to teal accent

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