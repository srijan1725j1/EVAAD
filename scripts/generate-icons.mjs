import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPngBuffer(width, height, drawPixelFn) {
  // width and height as 4-byte big endian
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + RGBA per pixel for each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crcVal = crc32(typeAndData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// Draw evaad icon:
// A modern dark circular/rounded badge with cyan-to-rose glowing gradient ring and centered stylized speech debate icon
function drawBadge(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2;

  // Background
  if (isMaskable) {
    // Solid dark slate-950 for maskable full bleed
    const bgR = 10, bgG = 13, bgB = 22;
    // Safe zone inner circle radius = maxR * 0.75
    const innerRadius = maxR * 0.72;
    if (dist > innerRadius) {
      return [bgR, bgG, bgB, 255];
    }
  } else {
    // Squircle/rounded rect for standard icon
    const cornerRadius = w * 0.22;
    const clampedX = Math.max(cornerRadius, Math.min(x, w - cornerRadius));
    const clampedY = Math.max(cornerRadius, Math.min(y, h - cornerRadius));
    const cDist = Math.hypot(x - clampedX, y - clampedY);
    if (cDist > cornerRadius) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Inner dark card fill: #070913
  let r = 7, g = 9, b = 19, a = 255;

  // Outer gradient ring: Cyan (#06b6d4) to Rose (#f43f5e)
  const ringRadius = (isMaskable ? maxR * 0.65 : maxR * 0.85);
  const ringThickness = w * 0.04;
  const distToRing = Math.abs(dist - ringRadius);

  if (distToRing < ringThickness) {
    // Angle from -PI to PI
    const angle = Math.atan2(dy, dx); // -PI to PI
    const t = (angle + Math.PI) / (2 * Math.PI); // 0 to 1
    // Interpolate Cyan (6, 182, 212) -> Rose (244, 63, 94) -> Cyan
    const ringT = Math.sin(t * Math.PI);
    r = Math.round(6 + (244 - 6) * ringT);
    g = Math.round(182 + (63 - 182) * ringT);
    b = Math.round(212 + (94 - 212) * ringT);
    return [r, g, b, 255];
  }

  // Central symbol: stylized "e" and debate quotes
  // We check distance from center
  const symbolScale = isMaskable ? 0.38 : 0.48;
  const nx = (x - cx) / (w * symbolScale);
  const ny = (y - cy) / (h * symbolScale);

  // Left debate speech bubble arc / 'e' shape:
  // outer arc between r = 0.5 and 0.8
  const sDist = Math.hypot(nx, ny);
  if (sDist >= 0.35 && sDist <= 0.65) {
    // Opening at bottom right (angle between 0.1 and 1.2 radians)
    const sAngle = Math.atan2(ny, nx);
    if (!(sAngle > 0.15 && sAngle < 1.1)) {
      const gradT = (nx + 1) / 2;
      r = Math.round(6 + (244 - 6) * gradT);
      g = Math.round(182 + (63 - 182) * gradT);
      b = Math.round(212 + (94 - 212) * gradT);
      return [r, g, b, 255];
    }
  }

  // Horizontal bar of the 'e'
  if (Math.abs(ny) < 0.12 && nx >= -0.55 && nx <= 0.6) {
    const gradT = (nx + 1) / 2;
    r = Math.round(6 + (244 - 6) * gradT);
    g = Math.round(182 + (63 - 182) * gradT);
    b = Math.round(212 + (94 - 212) * gradT);
    return [r, g, b, 255];
  }

  // Accent speech bubble tail at bottom-right
  if (nx > 0.35 && nx < 0.75 && ny > 0.35 && ny < 0.75) {
    const dLine = Math.abs((nx - 0.35) - (ny - 0.35));
    if (dLine < 0.15) {
      return [244, 63, 94, 255];
    }
  }

  return [7, 9, 19, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192, (x, y, w, h) => drawBadge(x, y, w, h, false)));

console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512, (x, y, w, h) => drawBadge(x, y, w, h, false)));

console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, (x, y, w, h) => drawBadge(x, y, w, h, true)));

console.log('Generating apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, (x, y, w, h) => drawBadge(x, y, w, h, false)));

console.log('Done generating PNG icons!');
