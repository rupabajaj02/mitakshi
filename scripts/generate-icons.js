const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');

function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#722ed1');
  gradient.addColorStop(1, '#531dab');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw plus sign
  ctx.fillStyle = 'white';
  const plusWidth = size * 0.15;
  const plusLength = size * 0.5;
  const centerX = size / 2;
  const centerY = size / 2;

  // Vertical bar
  ctx.fillRect(
    centerX - plusWidth / 2,
    centerY - plusLength / 2,
    plusWidth,
    plusLength
  );

  // Horizontal bar
  ctx.fillRect(
    centerX - plusLength / 2,
    centerY - plusWidth / 2,
    plusLength,
    plusWidth
  );

  // Add circular border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.35, 0, Math.PI * 2);
  ctx.stroke();
}

function generateIcons() {
  console.log('Generating StudyPulse icons...\n');

  sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    drawIcon(canvas, size);

    const buffer = canvas.toBuffer('image/png');
    const filename = `icon-${size}.png`;
    const filepath = path.join(publicDir, filename);

    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Generated ${filename} (${size}x${size})`);
  });

  // Generate favicon.ico (using 32x32)
  const faviconCanvas = createCanvas(32, 32);
  drawIcon(faviconCanvas, 32);
  const faviconBuffer = faviconCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer);
  console.log('✓ Generated favicon.png (32x32)');

  // Also create apple-touch-icon
  const appleCanvas = createCanvas(180, 180);
  drawIcon(appleCanvas, 180);
  const appleBuffer = appleCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleBuffer);
  console.log('✓ Generated apple-touch-icon.png (180x180)');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons();
