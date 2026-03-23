# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal website for Michael Banditt, a process optimization and automation specialist. The site consists of three main pages:
- `index.html` - Home page with introduction and services
- `ueber-mich.html` - About page with profile and experience
- `kontakt.html` - Contact page with communication options

## Code Architecture

### Structure
- HTML files for each page with consistent header navigation
- Shared CSS files for common styling (`css/style.css`)
- Page-specific CSS files for unique layouts (`css/home-page.css`, `css/about-page.css`, `css/contact-page.css`)
- Image assets in the `images/` directory

### Styling System
- CSS variables defined in `:root` for consistent color scheme:
  - `--primary-color`: #0F0F0F (deep black)
  - `--secondary-color`: #7A7A7A (medium gray)
  - `--accent-color`: #C8A14D (gold yellow)
  - `--light-color`: #D9D9D9 (silver gray)
- Modern card-based design with rounded corners and subtle shadows
- Responsive grid layouts using CSS Grid
- Mobile-first responsive design with media queries

### Naming Conventions
- CSS classes follow a descriptive pattern (e.g., `.hero-section`, `.contact-card`)
- Page-specific styles prefixed with page names (e.g., `.home-hero-modern`)
- Consistent class naming for similar components across pages

## Development Guidelines

### Editing HTML
- Maintain consistent header navigation across all pages
- Preserve the color scheme and styling conventions
- Keep semantic HTML structure with proper heading hierarchy
- Ensure all links are functional and point to correct destinations

### Editing CSS
- Use existing CSS variables for colors to maintain consistency
- Add page-specific styles to the appropriate CSS file
- Follow the established spacing and typography patterns
- Test responsive behavior when adding new components

### Images
- All images are stored in the `images/` directory
- Profile images and logos should maintain aspect ratios
- Background images are referenced in CSS files

## Common Development Tasks

### Adding New Content Sections
1. Identify the appropriate HTML file for the content
2. Add new sections using existing CSS classes where possible
3. Create new CSS rules in the page-specific CSS file if needed
4. Test responsive behavior on different screen sizes

### Updating Contact Information
- Contact details are in `kontakt.html`
- Email address is in mailto links
- LinkedIn profile link should be updated if changed

### Modifying Services/Expertise Lists
- Service cards are in `index.html` and styled in `css/home-page.css`
- Competency tags are in multiple files with consistent styling
- Tag groups maintain consistent structure across pages

## Testing

### Responsive Design
- Test on mobile, tablet, and desktop breakpoints
- Verify grid layouts adapt correctly
- Check that navigation remains functional on all devices

### Link Validation
- Verify all internal links point to correct pages
- Check external links (LinkedIn, email) function properly
- Ensure anchor links work for navigation within pages