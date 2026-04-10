# YaPress Plugin System

The YaPress plugin system allows you to extend functionality without modifying framework code. Plugins are distributed as npm packages and configured through site-owned files.

## Architecture

### Core Components

1. **Plugin Types** (`src/types/plugin.ts`) - TypeScript interfaces for plugins
2. **Plugin Loader** (`src/lib/plugins.ts`) - Loads and manages plugins
3. **Plugin Config** (`plugins.config.ts`) - Site-owned plugin registry
4. **Plugin Configurations** (`plugins/*/config.ts`) - Individual plugin settings

### Plugin Slots

Plugins can inject components at these locations:

- `bodyStart` - Top of `<body>` tag (tracking scripts)
- `bodyEnd` - Bottom of `<body>` tag (popups, modals)
- `headerStart` - Top of header
- `headerEnd` - Bottom of header
- `footerStart` - Top of footer
- `footerEnd` - Bottom of footer (newsletter forms)
- `beforePost` - Before post content
- `afterPost` - After post content (comments, CTAs)
- `popup` - Popup/modal layer

### Slot Ordering

If multiple plugins target the same slot, they render in ascending `order`.

- Lower `order` values render earlier
- The default `order` is `0`
- Plugins with the same `order` keep the registration order from `plugins.config.ts`

## Installing Plugins

### Quick Install

```bash
npm run enable-plugin subscription
```

This command:
1. Installs the plugin package from npm
2. Creates `plugins/<plugin-name>/config.ts`
3. Registers the plugin in `plugins.config.ts`

### Manual Install

```bash
# 1. Install package
npm install @yusufaytas/yapress-plugin-subscription

# 2. Create config file
mkdir -p plugins/subscription
cat > plugins/subscription/config.ts << 'EOF'
import type { SubscriptionConfig } from '@yusufaytas/yapress-plugin-subscription';

export const config: SubscriptionConfig = {
  enabled: true,
  // Add your configuration here
};
EOF

# 3. Register in plugins.config.ts
# Add import and plugin to the plugins array
```

## Creating a Plugin

### Plugin Structure

```typescript
// my-plugin/src/plugin.ts
import type { Plugin } from '@yusufaytas/yapress-core';

export interface MyPluginConfig {
  enabled: boolean;
  // ... your config options
}

export function createMyPlugin(config: MyPluginConfig): Plugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom plugin',
    enabled: config.enabled,
    
    // Components to inject
    components: {
      afterPost: config.showAfterPost ? [MyComponent] : [],
      footerEnd: config.showInFooter ? [MyFooterComponent] : [],
    },
  };
}
```

### Plugin Component

```typescript
// my-plugin/src/components/my-component.tsx
'use client';

import type { ContentEntry } from '@yusufaytas/yapress-core';

export function MyComponent({ 
  post
}: { 
  post?: ContentEntry;
}) {
  return (
    <div>
      <h3>Configured by the plugin factory</h3>
      {post && <p>Post: {post.title}</p>}
    </div>
  );
}
```

### Package.json

```json
{
  "name": "@yusufaytas/yapress-plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": "^19.0.0",
    "next": "^15.0.0"
  }
}
```

## Configuration

Plugin configuration stays site-owned and server-side. Plugin factories should close over that configuration and expose only the components they need to render. Do not pass secrets such as API keys through React props.

### Plugin Registry

```typescript
// plugins.config.ts
import type { Plugin } from '@/types/plugin';
import { createSubscriptionPlugin } from '@yusufaytas/yapress-plugin-subscription';
import { config as subscriptionConfig } from './plugins/subscription/config';

export const plugins: Plugin[] = [
  createSubscriptionPlugin(subscriptionConfig),
  // Add more plugins here
];
```

### Plugin Config

```typescript
// plugins/subscription/config.ts
import type { SubscriptionConfig } from '@yusufaytas/yapress-plugin-subscription';

export const config: SubscriptionConfig = {
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
  }
};
```

## Official Plugins

- **[@yusufaytas/yapress-plugin-subscription](https://github.com/yusufaytas/yapress-plugin-subscription)** - Newsletter subscriptions
- **[@yusufaytas/yapress-plugin-comments](https://github.com/yusufaytas/yapress-plugin-comments)** - Comments integration
- **[@yusufaytas/yapress-plugin-analytics](https://github.com/yusufaytas/yapress-plugin-analytics)** - Analytics tracking

## Best Practices

1. **Static-First**: Render to static HTML where possible
2. **Client Components**: Use `'use client'` only for interactive features
3. **Environment Variables**: Use env vars for secrets in site-owned config
4. **Type Safety**: Export TypeScript types for configuration
5. **Respect Slot Boundaries**: Style and structure only within the slot you are rendered into; do not assume surrounding page layout or target app-owned selectors
6. **Theme Inheritance**: Use the host CSS variables and typography tokens instead of hardcoded colors or fonts
7. **Documentation**: Include README with configuration examples
8. **Peer Dependencies**: Declare React/Next.js as peer dependencies
9. **Versioning**: Follow semantic versioning

## Troubleshooting

### Plugin Not Loading

1. Check `plugins.config.ts` has the correct import
2. Verify plugin is installed: `npm list @yusufaytas/yapress-plugin-*`
3. Ensure the plugin factory returns `enabled: true`
4. Check for TypeScript errors: `npx tsc --noEmit`

### Build Errors

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check plugin peer dependencies match your versions

### Runtime Errors

1. Check browser console for errors
2. Verify environment variables are set
3. Review plugin documentation for required configuration
