import fs from 'node:fs';
import path from 'node:path';

const iconSource = 'assets/images/fevicon.png';
const logoRoundedSource = 'assets/images/logo-rounded.png';
const icon192Source = 'assets/images/fevicon-192.png';
const fevicon512Source = 'assets/images/fevicon-512.png';

const resDir = 'android/app/src/main/res';

// Mipmap directories for launcher icons
const mipmapDirs = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

for (const dir of mipmapDirs) {
  const targetDir = path.join(resDir, dir);
  if (fs.existsSync(targetDir)) {
    fs.copyFileSync(icon192Source, path.join(targetDir, 'ic_launcher.png'));
    fs.copyFileSync(logoRoundedSource, path.join(targetDir, 'ic_launcher_round.png'));
    fs.copyFileSync(icon192Source, path.join(targetDir, 'ic_launcher_foreground.png'));
  }
}

// Splash screen drawables
const drawableDirs = [
  'drawable',
  'drawable-land-hdpi',
  'drawable-land-mdpi',
  'drawable-land-xhdpi',
  'drawable-land-xxhdpi',
  'drawable-land-xxxhdpi',
  'drawable-port-hdpi',
  'drawable-port-mdpi',
  'drawable-port-xhdpi',
  'drawable-port-xxhdpi',
  'drawable-port-xxxhdpi'
];

for (const dir of drawableDirs) {
  const targetDir = path.join(resDir, dir);
  if (fs.existsSync(targetDir)) {
    fs.copyFileSync(fevicon512Source, path.join(targetDir, 'splash.png'));
  }
}

console.log('Successfully updated Android launcher icons and splash screens with Attendora logo!');
