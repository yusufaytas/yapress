#!/usr/bin/env node

/**
 * Enable Plugin Script
 * Installs and configures a YaPress plugin
 * 
 * Usage: npm run enable-plugin <plugin-name>
 * Example: npm run enable-plugin subscription
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Available official plugins
const AVAILABLE_PLUGINS = {
  subscription: '@yusufaytas/yapress-plugin-subscription',
  comments: '@yusufaytas/yapress-plugin-comments',
  analytics: '@yusufaytas/yapress-plugin-analytics',
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => capitalize(word))
    .join('');
}

function enablePlugin(pluginName) {
  const packageName = AVAILABLE_PLUGINS[pluginName];
  
  if (!packageName) {
    console.error(`❌ Unknown plugin: ${pluginName}`);
    console.log('\nAvailable plugins:');
    Object.keys(AVAILABLE_PLUGINS).forEach(name => {
      console.log(`  - ${name}`);
    });
    process.exit(1);
  }
  
  console.log(`\n📦 Installing ${packageName}...`);
  
  try {
    execSync(`npm install ${packageName}`, { 
      stdio: 'inherit',
      cwd: rootDir 
    });
  } catch (error) {
    console.error(`❌ Failed to install ${packageName}`);
    process.exit(1);
  }
  
  // Create plugin config directory
  const pluginDir = path.join(rootDir, 'plugins', pluginName);
  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
  }
  
  // Create default config file
  const configPath = path.join(pluginDir, 'config.ts');
  if (fs.existsSync(configPath)) {
    console.log(`⚠️  Config file already exists: ${configPath}`);
  } else {
    const pascalName = toPascalCase(pluginName);
    const configTemplate = `import type { ${pascalName}Config } from '${packageName}';

export const config: ${pascalName}Config = {
  enabled: true,
  // TODO: Configure your plugin settings
  // See plugin documentation for available options
};
`;
    fs.writeFileSync(configPath, configTemplate);
    console.log(`✅ Created config file: plugins/${pluginName}/config.ts`);
  }
  
  // Update plugins.config.ts
  const pluginsConfigPath = path.join(rootDir, 'plugins.config.ts');
  let pluginsConfig = fs.readFileSync(pluginsConfigPath, 'utf-8');
  
  const pascalName = toPascalCase(pluginName);
  const importStatement = `import { create${pascalName}Plugin } from '${packageName}';\nimport { config as ${pluginName}Config } from './plugins/${pluginName}/config';`;
  const pluginEntry = `  create${pascalName}Plugin(${pluginName}Config),`;
  
  // Check if plugin is already added
  if (pluginsConfig.includes(packageName)) {
    console.log(`⚠️  Plugin already registered in plugins.config.ts`);
  } else {
    // Add import at the top (after existing imports)
    const importInsertPos = pluginsConfig.lastIndexOf('import');
    if (importInsertPos !== -1) {
      const nextLinePos = pluginsConfig.indexOf('\n', importInsertPos) + 1;
      pluginsConfig = pluginsConfig.slice(0, nextLinePos) + importStatement + '\n' + pluginsConfig.slice(nextLinePos);
    } else {
      // No imports yet, add after the comment block
      const typeImportPos = pluginsConfig.indexOf("import type { Plugin }");
      const nextLinePos = pluginsConfig.indexOf('\n', typeImportPos) + 1;
      pluginsConfig = pluginsConfig.slice(0, nextLinePos) + '\n' + importStatement + '\n' + pluginsConfig.slice(nextLinePos);
    }
    
    // Add plugin to array
    const arrayMatch = pluginsConfig.match(/export const plugins: Plugin\[\] = \[([\s\S]*?)\];/);
    if (arrayMatch) {
      const arrayContent = arrayMatch[1].trim();
      const newArrayContent = arrayContent 
        ? `\n${pluginEntry}\n  ${arrayContent}\n`
        : `\n${pluginEntry}\n`;
      pluginsConfig = pluginsConfig.replace(
        /export const plugins: Plugin\[\] = \[([\s\S]*?)\];/,
        `export const plugins: Plugin[] = [${newArrayContent}];`
      );
    }
    
    fs.writeFileSync(pluginsConfigPath, pluginsConfig);
    console.log(`✅ Updated plugins.config.ts`);
  }
  
  console.log(`\n✨ Plugin '${pluginName}' enabled successfully!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Configure the plugin in: plugins/${pluginName}/config.ts`);
  console.log(`   2. Add any required environment variables to .env.local`);
  console.log(`   3. Run 'npm run dev' to see your plugin in action\n`);
}

// Get plugin name from command line
const pluginName = process.argv[2];

if (!pluginName) {
  console.error('❌ Please specify a plugin name');
  console.log('\nUsage: npm run enable-plugin <plugin-name>');
  console.log('\nAvailable plugins:');
  Object.keys(AVAILABLE_PLUGINS).forEach(name => {
    console.log(`  - ${name}`);
  });
  process.exit(1);
}

enablePlugin(pluginName);
