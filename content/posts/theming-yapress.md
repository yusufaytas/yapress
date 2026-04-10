---
title: Theming Your YaPress Site
slug: theming-yapress
date: 2026-02-12
categories:
  - engineering
tags:
  - design
  - themes
  - customization
  - css
description: Complete guide to using built-in themes and creating custom themes in YaPress.
---

YaPress includes a flexible theming system with built-in presets and full customization options. Let's explore how to make your site look exactly how you want.

## Built-in Theme Presets

YaPress comes with four carefully crafted themes:

### Dark Theme (Default)

Modern dark theme with high contrast:

```typescript
// site.config.ts
export default {
  theme: {
    preset: 'dark',
  },
};
```

**Colors:**
- Background: Deep charcoal
- Text: Soft white
- Accent: Vibrant blue
- Perfect for: Tech blogs, developer sites

### Earth Theme

Warm, natural tones:

```typescript
export default {
  theme: {
    preset: 'earth',
  },
};
```

**Colors:**
- Background: Cream
- Text: Dark brown
- Accent: Terracotta
- Perfect for: Personal blogs, lifestyle content

### Ocean Theme

Cool, calming blues:

```typescript
export default {
  theme: {
    preset: 'ocean',
  },
};
```

**Colors:**
- Background: Light blue-gray
- Text: Navy
- Accent: Teal
- Perfect for: Travel blogs, photography sites

### Forest Theme

Fresh, natural greens:

```typescript
export default {
  theme: {
    preset: 'forest',
  },
};
```

**Colors:**
- Background: Soft sage
- Text: Forest green
- Accent: Moss green
- Perfect for: Environmental blogs, outdoor content

## Customizing Theme Tokens

Override specific design tokens while keeping a preset:

```typescript
// site.config.ts
export default {
  theme: {
    preset: 'dark',
    tokens: {
      // Colors
      accent: '#f97316',        // Orange accent
      link: '#c2410c',          // Darker orange for links
      bg: '#0a0a0a',            // Deeper black
      text: '#f5f5f5',          // Brighter text
      
      // Typography
      maxWidth: '78rem',        // Wider content
      fontSizeBase: '1.125rem', // Larger base font
      
      // Spacing
      heroTitleSize: 'clamp(3rem, 10vw, 7rem)',
      h2Size: '2.5rem',
      h3Size: '1.875rem',
      
      // Borders
      radiusSm: '0.25rem',
      radiusMd: '0.5rem',
      radiusLg: '1rem',
      
      // Shadows
      shadowSoft: '0 2px 8px rgba(0,0,0,0.1)',
      shadowStrong: '0 4px 16px rgba(0,0,0,0.2)',
    },
  },
};
```

## Available Theme Tokens

### Color Tokens

```typescript
{
  bg: string;              // Main background
  surface: string;         // Card/surface background
  border: string;          // Border color
  text: string;            // Primary text
  muted: string;           // Secondary text
  accent: string;          // Accent color (buttons, highlights)
  accentSoft: string;      // Soft accent (hover states)
  heroGlow: string;        // Hero section glow effect
  headerBg: string;        // Header background
  overlay: string;         // Modal/overlay background
  link: string;            // Link color
  linkHover: string;       // Link hover color
  linkUnderline: string;   // Link underline color
}
```

### Typography Tokens

```typescript
{
  fontSizeBase: string;         // Base font size (16px)
  lineHeightBase: string;       // Base line height (1.6)
  headingLetterSpacing: string; // Heading letter spacing
  headingLineHeight: string;    // Heading line height
  
  // Size tokens
  brandSize: string;            // Logo/brand size
  heroTitleSize: string;        // Hero title size
  pageTitleSize: string;        // Page title size
  articleTitleSize: string;     // Article title size
  cardTitleSize: string;        // Card title size
  taxonomyTitleSize: string;    // Category/tag title size
  h2Size: string;               // H2 heading size
  h3Size: string;               // H3 heading size
  h4Size: string;               // H4 heading size
  h5Size: string;               // H5 heading size
}
```

### Layout Tokens

```typescript
{
  maxWidth: string;        // Content max width
  radiusSm: string;        // Small border radius
  radiusMd: string;        // Medium border radius
  radiusLg: string;        // Large border radius
  shadowSoft: string;      // Soft shadow
  shadowStrong: string;    // Strong shadow
  shadowHeader: string;    // Header shadow
}
```

## Custom Typography

Change fonts while keeping the theme:

```typescript
// site.config.ts
export default {
  theme: {
    preset: 'dark',
    typography: {
      sans: '"Inter", system-ui, sans-serif',
      serif: '"Merriweather", Georgia, serif',
      mono: '"Fira Code", "Courier New", monospace',
    },
  },
};
```

### Using Google Fonts

Install fonts in your layout:

```typescript
// app/layout.tsx
import { Inter, Merriweather, Fira_Code } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const merriweather = Merriweather({ 
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${merriweather.variable} ${firaCode.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

Then reference in theme config:

```typescript
export default {
  theme: {
    typography: {
      sans: 'var(--font-sans)',
      serif: 'var(--font-serif)',
      mono: 'var(--font-mono)',
    },
  },
};
```

## Custom CSS File

For extensive customization, use a custom CSS file:

```typescript
// site.config.ts
export default {
  theme: {
    preset: 'dark',
    customCssHref: '/theme.css',
  },
};
```

Create `public/theme.css`:

```css
/* Custom theme overrides */
:root {
  /* Override any CSS variable */
  --accent: #ff6b6b;
  --link: #ff6b6b;
  --radius-md: 1rem;
}

/* Custom component styles */
.article-card {
  border: 2px solid var(--accent);
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-4px);
}

/* Custom typography */
h1, h2, h3 {
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* Custom code blocks */
pre {
  border-left: 4px solid var(--accent);
}
```

## Creating a Complete Custom Theme

Build a theme from scratch:

```typescript
// site.config.ts
export default {
  theme: {
    tokens: {
      // Base colors
      bg: '#fafafa',
      surface: '#ffffff',
      border: '#e5e5e5',
      text: '#171717',
      muted: '#737373',
      
      // Accent colors
      accent: '#8b5cf6',
      accentSoft: '#ede9fe',
      link: '#7c3aed',
      linkHover: '#6d28d9',
      linkUnderline: '#c4b5fd',
      
      // Special colors
      heroGlow: 'rgba(139, 92, 246, 0.1)',
      headerBg: 'rgba(250, 250, 250, 0.8)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      
      // Layout
      maxWidth: '72rem',
      radiusSm: '0.375rem',
      radiusMd: '0.75rem',
      radiusLg: '1.5rem',
      
      // Shadows
      shadowSoft: '0 1px 3px rgba(0,0,0,0.1)',
      shadowStrong: '0 10px 25px rgba(0,0,0,0.15)',
      shadowHeader: '0 1px 0 rgba(0,0,0,0.05)',
      
      // Typography
      fontSizeBase: '1rem',
      lineHeightBase: '1.75',
      headingLetterSpacing: '-0.025em',
      headingLineHeight: '1.2',
      
      // Sizes
      brandSize: '1.5rem',
      heroTitleSize: 'clamp(2.5rem, 8vw, 5rem)',
      pageTitleSize: 'clamp(2rem, 5vw, 3rem)',
      articleTitleSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      cardTitleSize: '1.5rem',
      taxonomyTitleSize: '1.25rem',
      h2Size: '2rem',
      h3Size: '1.5rem',
      h4Size: '1.25rem',
      h5Size: '1.125rem',
    },
    typography: {
      sans: '"Inter", system-ui, sans-serif',
      serif: '"Lora", Georgia, serif',
      mono: '"JetBrains Mono", monospace',
    },
  },
};
```

## Dark Mode Support

All themes support automatic dark mode:

```css
/* Light mode (default) */
:root {
  --bg: #ffffff;
  --text: #000000;
}

/* Dark mode (automatic) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a0a0a;
    --text: #fafafa;
  }
}
```

### Manual Dark Mode Toggle

Add a theme toggle component:

```typescript
// components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = stored || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## Responsive Typography

Use clamp() for fluid typography:

```typescript
export default {
  theme: {
    tokens: {
      // Scales from 2.5rem to 5rem based on viewport
      heroTitleSize: 'clamp(2.5rem, 8vw, 5rem)',
      
      // Scales from 1.75rem to 2.5rem
      articleTitleSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      
      // Scales from 1rem to 1.125rem
      fontSizeBase: 'clamp(1rem, 2vw, 1.125rem)',
    },
  },
};
```

## Theme Examples

### Minimal Theme

Clean, typography-focused:

```typescript
export default {
  theme: {
    tokens: {
      bg: '#ffffff',
      surface: '#fafafa',
      border: '#e5e5e5',
      text: '#000000',
      muted: '#666666',
      accent: '#000000',
      accentSoft: '#f5f5f5',
      link: '#000000',
      linkHover: '#666666',
      
      maxWidth: '65ch',
      fontSizeBase: '1.125rem',
      lineHeightBase: '1.8',
      
      radiusSm: '0',
      radiusMd: '0',
      radiusLg: '0',
      
      shadowSoft: 'none',
      shadowStrong: 'none',
    },
    typography: {
      sans: '"Inter", sans-serif',
      serif: '"Crimson Pro", serif',
    },
  },
};
```

### Vibrant Theme

Bold, colorful:

```typescript
export default {
  theme: {
    tokens: {
      bg: '#0f172a',
      surface: '#1e293b',
      border: '#334155',
      text: '#f1f5f9',
      muted: '#94a3b8',
      accent: '#f59e0b',
      accentSoft: '#fef3c7',
      link: '#fbbf24',
      linkHover: '#f59e0b',
      heroGlow: 'rgba(245, 158, 11, 0.2)',
      
      radiusSm: '0.5rem',
      radiusMd: '1rem',
      radiusLg: '1.5rem',
      
      shadowSoft: '0 4px 6px rgba(0,0,0,0.3)',
      shadowStrong: '0 20px 25px rgba(0,0,0,0.5)',
    },
  },
};
```

### Magazine Theme

Editorial style:

```typescript
export default {
  theme: {
    tokens: {
      bg: '#ffffff',
      surface: '#f9fafb',
      border: '#d1d5db',
      text: '#111827',
      muted: '#6b7280',
      accent: '#dc2626',
      accentSoft: '#fee2e2',
      link: '#dc2626',
      
      maxWidth: '80rem',
      heroTitleSize: 'clamp(3rem, 10vw, 6rem)',
      
      fontSizeBase: '1.0625rem',
      lineHeightBase: '1.7',
      headingLetterSpacing: '-0.03em',
    },
    typography: {
      sans: '"Inter", sans-serif',
      serif: '"Playfair Display", serif',
    },
  },
};
```

## Testing Your Theme

### Check Contrast

Ensure text is readable:

```bash
# Use browser DevTools
# Lighthouse > Accessibility > Contrast
```

Minimum contrast ratios:
- Normal text: 4.5:1
- Large text: 3:1

### Test Dark Mode

```css
/* Force dark mode for testing */
html[data-theme="dark"] {
  /* Your dark mode styles */
}
```

### Test Responsive Sizes

Check typography at different viewports:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px
- Wide: 1920px

## Theme Checklist

- [ ] Choose base preset or create custom
- [ ] Set color tokens
- [ ] Configure typography
- [ ] Test contrast ratios
- [ ] Check dark mode
- [ ] Test responsive sizes
- [ ] Verify on mobile devices
- [ ] Check code block styling
- [ ] Test with long content
- [ ] Verify plugin compatibility

## Resources

- [CSS Variables Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Google Fonts](https://fonts.google.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors](https://coolors.co/) - Color palette generator

---

With YaPress theming, you have full control over your site's appearance while maintaining clean, maintainable code. Start with a preset and customize from there.
