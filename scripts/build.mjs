import fs from 'node:fs';
import path from 'node:path';

const dist = 'www';

if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });
const itemsToCopy = ['index.html', 'src', 'assets', 'pwa'];

for (const item of itemsToCopy) {
  if (fs.existsSync(item)) {
    fs.cpSync(item, path.join(dist, item), { recursive: true });
  }
}

console.log('Build completed successfully: assets copied to www/');
