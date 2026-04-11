---
title: Mobile Optimization in YaPress
slug: mobile-optimization-yapress
datePublished: 2026-03-15
categories:
  - engineering
tags:
  - mobile
  - responsive-design
  - ux
description: How we optimized YaPress for mobile devices with elegant navigation, improved layouts, and better content rendering.
---

Mobile traffic accounts for over 60% of web usage today. YaPress is built mobile-first with careful attention to touch interactions, readability, and performance on smaller screens.

## Mobile Navigation with Hamburger Menu

On mobile devices, screen real estate is precious. We implemented a clean hamburger menu that keeps the header compact while providing full navigation access.

### How It Works

The mobile header features:

- **Compact branding**: Logo and site title optimized for small screens
- **Hamburger icon**: Three-line menu button that's instantly recognizable
- **Slide-down menu**: Full-width navigation that appears on tap
- **Smooth animations**: Menu transforms into an X when open

### Implementation Details

The hamburger menu uses:

```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false)

// Toggle button with animated lines
<button 
  className="menu-toggle"
  aria-expanded={isMenuOpen}
  onClick={() => setIsMenuOpen(!isMenuOpen)}
>
  <span className="menu-toggle__line"></span>
  <span className="menu-toggle__line"></span>
  <span className="menu-toggle__line"></span>
</button>
```

CSS handles the animation:

```css
.menu-toggle__line {
  transition: all 200ms ease;
}

.menu-toggle[aria-expanded="true"] .menu-toggle__line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.menu-toggle[aria-expanded="true"] .menu-toggle__line:nth-child(2) {
  opacity: 0;
}

.menu-toggle[aria-expanded="true"] .menu-toggle__line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}
```

## Improved Footer Layout

The footer on mobile now uses card-style sections that make it easy to identify different link groups.

### Visual Hierarchy

Each footer column:

- Has its own card container with subtle background
- Uses rounded corners for a modern look
- Includes proper spacing between sections
- Stacks vertically for easy scanning

### Touch-Friendly Links

All footer links have:

- Minimum 44x44px touch targets (WCAG guidelines)
- Adequate spacing between items
- Clear visual feedback on tap

## Optimized Post Listings

Post previews on mobile are redesigned for better readability:

### Compact Metadata

Instead of spreading metadata horizontally, we:

- Stack date and reading time vertically
- Use bullet separators that adapt to wrapping
- Reduce font size for secondary information

### Title Optimization

Post titles now:

- Use responsive font sizing with `clamp()`
- Have proper line height for multi-line titles
- Break naturally at word boundaries

### Excerpt Truncation

Long excerpts are limited to 3 lines using CSS:

```css
.post-preview .lede {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

This keeps the listing scannable without overwhelming users.

## Pagination Improvements

Mobile pagination is now more intuitive:

### Caret Navigation

Instead of "Previous" and "Next" text, we use:

- Left caret (←) for previous page
- Right caret (→) for next page
- Same size as page number buttons for consistency

### Centered Layout

All pagination controls are:

- Centered horizontally
- Properly spaced for touch
- Visually balanced

### Responsive Sizing

Button sizes adapt to screen width:

- Larger on tablets (2.5rem)
- Slightly smaller on phones (2.35rem)
- Always meeting minimum touch target size

## Code Block Handling

Code blocks on mobile need special attention:

### Horizontal Scrolling

Code never wraps. Instead:

```css
.code-block pre {
  overflow-x: auto;
  white-space: pre;
  -webkit-overflow-scrolling: touch;
}
```

This preserves formatting while allowing horizontal scrolling.

### Full-Width Rendering

On mobile, code blocks:

- Maintain proper borders on all sides
- Use slightly smaller font size (0.86rem)
- Keep syntax highlighting readable
- Support smooth touch scrolling

## Content Width Optimization

The article body now uses full container width on all devices:

### Before

```css
.article-body {
  max-width: 72ch; /* Limited to ~72 characters */
}
```

### After

```css
.article-body {
  max-width: 100%; /* Uses full container width */
}
```

This prevents premature line breaks and makes better use of available space.

### Word Breaking

We use smart word breaking:

```css
.article-body {
  overflow-wrap: break-word; /* Only break when necessary */
  word-break: normal; /* Don't break mid-word */
}
```

Text flows naturally and only breaks when a word is too long to fit.

## Touch Interactions

All interactive elements are optimized for touch:

### Tap Highlights

Remove default tap highlights for custom styling:

```css
.nav a,
.footer-nav a,
.pill {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

### Active States

Buttons and links have clear active states:

```css
.nav a:active {
  background: var(--accent-soft);
  border-color: var(--accent);
  transform: translateY(1px);
}
```

This provides immediate visual feedback on tap.

## Performance Considerations

Mobile optimization isn't just about layout:

### Reduced Animations

On mobile, we:

- Remove transform effects on hover (not applicable to touch)
- Use simpler transitions
- Avoid expensive animations

### Efficient Rendering

The hamburger menu uses:

- CSS transforms (GPU-accelerated)
- Max-height transitions (smooth performance)
- Minimal repaints

## Accessibility

Mobile accessibility is crucial:

### ARIA Labels

All interactive elements have proper labels:

```typescript
<button
  aria-label="Toggle menu"
  aria-expanded={isMenuOpen}
>
```

### Keyboard Navigation

Even on mobile, keyboard users can:

- Tab through all interactive elements
- Activate buttons with Enter/Space
- Navigate with arrow keys where appropriate

### Screen Reader Support

We ensure:

- Proper heading hierarchy
- Descriptive link text
- Hidden decorative elements with `aria-hidden`

## Testing Checklist

When testing mobile:

- [ ] Test on actual devices (not just browser DevTools)
- [ ] Check both portrait and landscape orientations
- [ ] Verify touch targets are at least 44x44px
- [ ] Test with one-handed use
- [ ] Check on slow 3G connections
- [ ] Verify text is readable without zooming
- [ ] Test with different font size settings

## Browser Support

Mobile optimizations work on:

- iOS Safari 14+
- Chrome for Android 90+
- Samsung Internet 14+
- Firefox for Android 90+

## Common Mobile Issues We Solved

### Issue: Menu Overlaps Content

**Solution**: Use `z-index` and proper positioning:

```css
.nav {
  position: absolute;
  z-index: 50;
}
```

### Issue: Horizontal Scroll on Body

**Solution**: Ensure containers don't overflow:

```css
.container {
  width: min(calc(100% - 1.5rem), var(--max-width));
  overflow-x: hidden;
}
```

### Issue: Tiny Touch Targets

**Solution**: Minimum sizes for all interactive elements:

```css
.nav a {
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
}
```

## Future Improvements

We're considering:

- **Swipe gestures**: Navigate between posts with swipe
- **Pull to refresh**: Reload content with pull gesture
- **Bottom navigation**: Alternative nav pattern for mobile
- **Progressive Web App**: Add to home screen support

## Best Practices

When building for mobile:

1. **Test early and often** on real devices
2. **Design for thumbs** - place important actions within reach
3. **Minimize typing** - use selects and buttons over text input
4. **Optimize images** - use responsive images with `srcset`
5. **Reduce network requests** - bundle and minify assets
6. **Use system fonts** when possible for faster loading

## Measuring Success

Track these metrics:

- **Mobile bounce rate**: Should be similar to desktop
- **Time on page**: Mobile users should engage as long as desktop
- **Scroll depth**: Users should reach the end of articles
- **Tap accuracy**: Low misclick rate on navigation

## Resources

- [Mobile Web Best Practices](https://web.dev/mobile/)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
- [Responsive Design Patterns](https://responsivedesign.is/patterns/)
- [Mobile Performance](https://web.dev/fast/)

---

Mobile optimization is an ongoing process. As devices and user expectations evolve, we'll continue refining the mobile experience in YaPress.

Try it yourself - open your YaPress site on your phone and see how it feels!
