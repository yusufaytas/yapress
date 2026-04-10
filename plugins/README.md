# Plugins Directory

This directory contains site-owned plugin configurations. Each plugin you enable will have its own subdirectory with a `config.ts` file.

## Structure

```
plugins/
├── subscription/
│   └── config.ts       # Subscription plugin configuration
├── comments/
│   └── config.ts       # Comments plugin configuration
└── analytics/
    └── config.ts       # Analytics plugin configuration
```

## Installing Plugins

Use the enable-plugin script to install and configure plugins:

```bash
npm run enable-plugin subscription
npm run enable-plugin comments
npm run enable-plugin analytics
```

## Available Plugins

- **subscription** - Newsletter subscriptions (Mailchimp, ConvertKit, custom)
- **comments** - Comments (Giscus, Utterances, Disqus)
- **analytics** - Analytics (Plausible, Google Analytics, custom)

## Configuration

Each plugin has its own configuration file where you can customize behavior, appearance, and integration settings. See the plugin's documentation for available options.

## Environment Variables

Plugins may require environment variables (API keys, etc.). Add these to `.env.local`:

```bash
# Example for subscription plugin
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_LIST_ID=your-list-id
```

## Disabling Plugins

To disable a plugin without uninstalling it, set `enabled: false` in its config file:

```typescript
export const config = {
  enabled: false,
  // ... other settings
};
```
