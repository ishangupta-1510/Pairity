const fs = require('fs');
const path = require('path');

// Create a simple 1024x1024 PNG placeholder
const createPlaceholderPNG = () => {
  // PNG header and simple red square
  const width = 1024;
  const height = 1024;
  
  // Minimal PNG data for a solid color image
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    // IHDR chunk
    0x00, 0x00, 0x00, 0x0D, // Length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x04, 0x00, // Width: 1024
    0x00, 0x00, 0x04, 0x00, // Height: 1024
    0x08, 0x02, // Bit depth: 8, Color type: 2 (RGB)
    0x00, 0x00, 0x00, // Compression, Filter, Interlace
    0x00, 0x00, 0x00, 0x00, // CRC (simplified, not actual)
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // Length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return pngData;
};

// Create assets
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder images
const placeholderPNG = createPlaceholderPNG();

fs.writeFileSync(path.join(assetsDir, 'icon.png'), placeholderPNG);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), placeholderPNG);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), placeholderPNG);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), placeholderPNG);

console.log('✅ Created placeholder assets');