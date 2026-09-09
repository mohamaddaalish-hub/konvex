import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = path.join(root, 'styles');
const appDir = path.join(root, 'app');
const paths = ['tokens', 'base', 'design-system'];
const development = process.argv.includes('--dev');

for (const name of paths) {
  const file = path.join(stylesDir, `${name}.css`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required style source: ${path.relative(root, file)}`);
  }
}

fs.mkdirSync(appDir, { recursive: true });
const output = development
  ? paths.map((p) => `@import '../styles/${p}.css';`).join('\n') + '\n'
  : '/* Generated from styles/tokens.css, styles/base.css and styles/design-system.css. Edit those sources. */\n' +
    paths.map((p) => fs.readFileSync(path.join(stylesDir, `${p}.css`), 'utf8')).join('\n');

fs.writeFileSync(path.join(appDir, 'globals.css'), output);
console.log(development ? 'Modular development styles ready.' : 'Production design system combined into one stylesheet.');
