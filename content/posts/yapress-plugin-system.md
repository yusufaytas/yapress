---
title: Understanding the YaPress Plugin System
slug: yapress-plugin-system
date: 2026-02-05
categories:
  - engineering
tags:
  - plugins
  - customization
  - extensibility
description: Learn how to extend YaPress functionality with plugins without modifying framework code.
---

YaPress includes a powerful plugin system that lets you add features like newsletter subscriptions, comments, and analytics without touching framework code. Here's how it works.

## Why Plugins?

Plugins solve a key problem: how do you extend functionality while maintaining the framework/site split?

### Without Plugins

You'd have to:
- Fork the framework
- Modify core files
- Merge conflicts on every update
- Maintain custom code forever

### With Plugins

You can:
- Install from npm
- Configure in your site
- Update independently
- Share across projects

## Plugin Architecture

### Core Components

YaPress plugins have four main parts:

1. **Plugin Package**: npm package with components
2. **Plugin Config**: Site-owned configuration file
3. **Plugin Registry**: Central plugin list
4. **Plugin Slots**: Injection points in the layout

### How It Works

```typescript
// 1. Plugin package exports a factory
export function createSubscriptionPlugin(config: SubscriptionConfig): Plugin {
  return {
    name: 'subscription',
    enabled: config.enabled,
    components: {
      afterPost: [SubscriptionForm],
      footerEnd: [NewsletterCTA],
    },
  };
}

// 2. You configure it in your site
// plugins/subscription/config.ts
export const config = {
  enabled: true,
  provider: 'mailchimp',
  apiKey: process.env.MAILCHIMP_API_KEY,
};

// 3. Register in plugins.config.ts
import { createSubscriptionPlugin } from '@yusufaytas/yapress-plugin-subscription';
import { config } from './plugins/subscription/config';

export const plugins = [
  createSubscriptionPlugin(config),
];
```

## Available Plugin Slots

Plugins can inject components at these locations:

### Layout Slots

- **bodyStart**: Top of `<body>` tag (tracking scripts)
- **bodyEnd**: Bottom of `<body>` tag (popups, modals)
- **headerStart**: Top of header
- **headerEnd**: Bottom of header
- **footerStart**: Top of footer
- **footerEnd**: Bottom of footer (newsletter forms)

### Content Slots

- **beforePost**: Before post content
- **afterPost**: After post content (comments, related posts)
- **popup**: Popup/modal layer

### Slot Ordering

Multiple plugins can use the same slot. They render in order:

```typescript
export function createMyPlugin(config): Plugin {
  return {
    name: 'my-plugin',
    components: {
      afterPost: [MyComponent],
    },
    order: 10, // Lower numbers render first
  };
}
```

Default order is `0`. Plugins with the same order render in registration order.

## Installing Plugins

### Quick Install

Use the enable-plugin script:

```bash
npm run enable-plugin subscription
```

This automatically:
1. Installs the npm package
2. Creates `plugins/subscription/config.ts`
3. Registers in `plugins.config.ts`

### Manual Install

If you prefer manual control:

```bash
# 1. Install package
npm install @yusufaytas/yapress-plugin-subscription

# 2. Create config
mkdir -p plugins/subscription
cat > plugins/subscription/config.ts << 'EOF'
import type { SubscriptionConfig } from '@yusufaytas/yapress-plugin-subscription';

export const config: SubscriptionConfig = {
  enabled: true,
  provider: 'mailchimp',
  apiKey: process.env.MAILCHIMP_API_KEY!,
  listId: process.env.MAILCHIMP_LIST_ID!,
};
EOF

# 3. Register plugin
# Edit plugins.config.ts and add:
# import { createSubscriptionPlugin } from '@yusufaytas/yapress-plugin-subscription';
# import { config as subscriptionConfig } from './plugins/subscription/config';
# 
# export const plugins = [
#   createSubscriptionPlugin(subscriptionConfig),
# ];
```

## Official Plugins

### Subscription Plugin

Newsletter subscriptions with multiple providers:

```bash
npm run enable-plugin subscription
```

**Features:**
- Mailchimp integration
- ConvertKit integration
- Custom API endpoints
- Multiple placement options
- Customizable UI

**Configuration:**

```typescript
// plugins/subscription/config.ts
export const config = {
  enabled: true,
  provider: 'mailchimp',
  apiKey: process.env.MAILCHIMP_API_KEY!,
  listId: process.env.MAILCHIMP_LIST_ID!,
  
  placement: {
    afterPost: true,
    popup: false,
    footer: true,
  },
  
  ui: {
    title: "Subscribe to our newsletter",
    description: "Get the latest posts delivered right to your inbox.",
    buttonText: "Subscribe",
    successMessage: "Thanks for subscribing!",
  },
};
```

### Comments Plugin

Add comments to your posts:

```bash
npm run enable-plugin comments
```

**Supported providers:**
- Giscus (GitHub Discussions)
- Utterances (GitHub Issues)
- Disqus

**Configuration:**

```typescript
// plugins/comments/config.ts
export const config = {
  enabled: true,
  provider: 'giscus',
  
  giscus: {
    repo: 'username/repo',
    repoId: 'R_...',
    category: 'Announcements',
    categoryId: 'DIC_...',
    mapping: 'pathname',
    theme: 'preferred_color_scheme',
  },
};
```

### Analytics Plugin

Track visitors with privacy-focused analytics:

```bash
npm run enable-plugin analytics
```

**Supported providers:**
- Plausible
- Google Analytics 4
- Custom tracking

**Configuration:**

```typescript
// plugins/analytics/config.ts
export const config = {
  enabled: true,
  provider: 'plausible',
  
  plausible: {
    domain: 'yourdomain.com',
    customDomain: 'analytics.yourdomain.com', // Optional
  },
};
```

## Creating Your Own Plugin

### Plugin Structure

Create a new npm package:

```
my-plugin/
├── src/
│   ├── plugin.ts          # Plugin factory
│   ├── components/
│   │   └── my-component.tsx
│   └── index.ts           # Exports
├── package.json
└── tsconfig.json
```

### Plugin Factory

```typescript
// src/plugin.ts
import type { Plugin } from '@yusufaytas/yapress-core';
import { MyComponent } from './components/my-component';

export interface MyPluginConfig {
  enabled: boolean;
  apiKey: string;
  showAfterPost?: boolean;
}

export function createMyPlugin(config: MyPluginConfig): Plugin {
  if (!config.enabled) {
    return {
      name: 'my-plugin',
      enabled: false,
      components: {},
    };
  }
  
  return {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom plugin',
    enabled: true,
    
    components: {
      afterPost: config.showAfterPost ? [MyComponent] : [],
    },
  };
}
```

### Plugin Component

```typescript
// src/components/my-component.tsx
'use client';

import type { ContentEntry } from '@yusufaytas/yapress-core';

export function MyComponent({ 
  post 
}: { 
  post?: ContentEntry;
}) {
  return (
    <div className="my-plugin-container">
      <h3>My Plugin</h3>
      {post && <p>Post: {post.title}</p>}
    </div>
  );
}
```

### Package Configuration

```json
{
  "name": "@username/yapress-plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "next": "^15.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Export Everything

```typescript
// src/index.ts
export { createMyPlugin } from './plugin';
export type { MyPluginConfig } from './plugin';
```

## Configuration Best Practices

### Use Environment Variables

Never commit secrets:

```typescript
// plugins/subscription/config.ts
export const config = {
  enabled: true,
  apiKey: process.env.MAILCHIMP_API_KEY!, // From .env.local
  listId: process.env.MAILCHIMP_LIST_ID!,
};
```

Add to `.env.local`:

```bash
MAILCHIMP_API_KEY=your-api-key-here
MAILCHIMP_LIST_ID=your-list-id-here
```

### Type Safety

Export TypeScript types:

```typescript
export interface MyPluginConfig {
  enabled: boolean;
  apiKey: string;
  options?: {
    theme?: 'light' | 'dark';
    position?: 'top' | 'bottom';
  };
}
```

### Conditional Rendering

Only render when needed:

```typescript
export function createMyPlugin(config: MyPluginConfig): Plugin {
  return {
    name: 'my-plugin',
    enabled: config.enabled,
    components: {
      // Only show on posts, not pages
      afterPost: config.showOnPosts ? [MyComponent] : [],
      // Only show in footer if enabled
      footerEnd: config.showInFooter ? [FooterComponent] : [],
    },
  };
}
```

## Styling Plugins

### Use CSS Variables

Respect the site's theme:

```css
.my-plugin-container {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.my-plugin-button {
  background: var(--accent);
  color: var(--bg);
}
```

### Scoped Styles

Keep styles scoped to your plugin:

```typescript
export function MyComponent() {
  return (
    <div className="my-plugin-container">
      <style jsx>{`
        .my-plugin-container {
          /* Scoped styles */
        }
      `}</style>
      {/* Component content */}
    </div>
  );
}
```

## Debugging Plugins

### Check Plugin Loading

```bash
# Build and check for errors
npm run build

# Check TypeScript
npx tsc --noEmit
```

### Verify Registration

Check `plugins.config.ts`:

```typescript
export const plugins = [
  createMyPlugin(myConfig),
];

console.log('Loaded plugins:', plugins.map(p => p.name));
```

### Browser Console

Check for runtime errors:

```javascript
// In browser console
console.log('Plugin components:', window.__YAPRESS_PLUGINS__);
```

## Plugin Distribution

### Publishing to npm

```bash
# Build your plugin
npm run build

# Publish
npm publish --access public
```

### Versioning

Follow semantic versioning:

- **1.0.0**: Initial release
- **1.0.1**: Bug fixes
- **1.1.0**: New features (backward compatible)
- **2.0.0**: Breaking changes

## Troubleshooting

### Plugin Not Loading

1. Check `plugins.config.ts` has correct import
2. Verify package is installed: `npm list @username/yapress-plugin-*`
3. Ensure `enabled: true` in config
4. Check for TypeScript errors

### Build Errors

```bash
# Clear cache
rm -rf .next

# Reinstall
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Runtime Errors

1. Check browser console
2. Verify environment variables
3. Review plugin documentation
4. Check peer dependency versions

## Example: Custom Analytics Plugin

Here's a complete example:

```typescript
// src/plugin.ts
import type { Plugin } from '@yusufaytas/yapress-core';
import { AnalyticsScript } from './components/analytics-script';

export interface CustomAnalyticsConfig {
  enabled: boolean;
  trackingId: string;
  debug?: boolean;
}

export function createCustomAnalyticsPlugin(
  config: CustomAnalyticsConfig
): Plugin {
  return {
    name: 'custom-analytics',
    version: '1.0.0',
    enabled: config.enabled,
    
    components: {
      bodyEnd: [
        () => <AnalyticsScript 
          trackingId={config.trackingId}
          debug={config.debug}
        />
      ],
    },
  };
}
```

```typescript
// src/components/analytics-script.tsx
'use client';

import { useEffect } from 'react';

export function AnalyticsScript({ 
  trackingId,
  debug = false 
}: { 
  trackingId: string;
  debug?: boolean;
}) {
  useEffect(() => {
    // Initialize analytics
    if (debug) {
      console.log('Analytics initialized:', trackingId);
    }
    
    // Track page views
    const handleRouteChange = () => {
      if (debug) {
        console.log('Page view:', window.location.pathname);
      }
      // Send to analytics service
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [trackingId, debug]);
  
  return null;
}
```

## Resources

- [Plugin API Documentation](https://github.com/yapress/yapress/docs/plugins)
- [Official Plugins](https://github.com/yapress)
- [Plugin Examples](https://github.com/yapress/yapress-examples)

---

The plugin system keeps your site maintainable while adding powerful features. Start with official plugins, then create your own as needed.
