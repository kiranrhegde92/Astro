/**
 * Generate app icon PNGs from the SVG source.
 *
 * Usage:  node scripts/generate-icons.js
 *
 * Outputs:
 *   assets/icon.png           - 1024x1024  (App Store / Play Store)
 *   assets/adaptive-icon.png  - 1024x1024  (Android adaptive foreground)
 *   assets/favicon.png        - 64x64      (Web)
 *   assets/splash-icon.png    - 512x512    (Expo splash)
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_PATH = path.resolve(__dirname, '..', 'assets', 'logo.svg');
const ASSETS = path.resolve(__dirname, '..', 'assets');

const TARGETS = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 512 },
  { name: 'favicon.png', size: 64 },
];

async function main() {
  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const target of TARGETS) {
    const outPath = path.join(ASSETS, target.name);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(outPath);
    console.log(`  ${target.name}  (${target.size}x${target.size})`);
  }

  console.log('\nDone. All icons written to assets/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
