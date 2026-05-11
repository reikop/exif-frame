import Photo from '../../core/photo';
import { Store } from '../../store';
import sandbox from '../../core/drawing/sandbox';
import { ThemeFunc } from '../../core/drawing/theme';
import { ThemeOption, ThemeOptionInput } from '../../pages/theme/types/theme-option';
import overrideExifMetadata from '../../core/exif-metadata/override-exif-metadata';

const DOT_MATRIX_FONT_NAMES = ['default', 'copy-1', 'copy-2'];

const DATABACK_OPTIONS: ThemeOption[] = [
  {
    id: 'DATE_FORMAT',
    type: 'select',
    options: [
      "'YY M DD",
      "'YY MM DD",
      "'YY年 M月DD日",
      'DD HH:MM',
    ],
    default: "'YY M DD",
    description: 'date stamp format',
    visibleWhen: { id: 'SHOW_DATE', value: true, default: true },
  },
  {
    id: 'POSITION',
    type: 'select',
    options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    default: 'bottom-right',
    description: 'date stamp position',
  },
  {
    id: 'TEXT_COLOR',
    type: 'color',
    default: '#FF2A00',
    description: 'lit LED core color',
  },
  { id: 'TEXT_ALPHA', type: 'range-slider', default: 1, min: 0, max: 1, step: 0.01, description: '0 - 1' },
  { id: 'RENDERING_STYLE', type: 'select', options: ['segment-lamp', 'dot-matrix', 'font'], default: 'segment-lamp', description: 'segment-lamp matches film databack LEDs' },
  { id: 'DOT_MATRIX_FONT', type: 'select', options: DOT_MATRIX_FONT_NAMES, default: 'default', description: 'dot matrix glyph set', visibleWhen: { id: 'RENDERING_STYLE', value: 'dot-matrix', default: 'segment-lamp' } },
  { id: 'FONT_SIZE', type: 'range-slider', default: 150, min: 20, max: 400, step: 1, description: 'px' },
  { id: 'SPACE_GAP', type: 'range-slider', default: 145, min: -50, max: 260, step: 1, description: 'extra px added on spaces only' },
  { id: 'OFFSET_X', type: 'range-slider', default: 450, min: 0, max: 1000, step: 5, description: 'horizontal distance from edge (px)' },
  { id: 'OFFSET_Y', type: 'range-slider', default: 330, min: 0, max: 1000, step: 5, description: 'vertical distance from edge (px)' },
  { id: 'GLOW', type: 'boolean', default: true, description: 'soft glow like LED stamp' },
  { id: 'GLOW_COLOR', type: 'color', default: '#FF1600', description: 'red halation color', visibleWhen: { id: 'GLOW', value: true, default: true } },
  { id: 'GLOW_RADIUS', type: 'range-slider', default: 64, min: 0, max: 160, step: 0.5, description: 'glow blur radius (px)', visibleWhen: { id: 'GLOW', value: true, default: true } },
  { id: 'GLOW_INTENSITY', type: 'range-slider', default: 2.35, min: 0, max: 4, step: 0.05, description: 'bloom strength', visibleWhen: { id: 'GLOW', value: true, default: true } },
  { id: 'BLUR', type: 'range-slider', default: 2.2, min: 0, max: 16, step: 0.1, description: 'text blur (px, decimal)' },
  { id: 'SHOW_DATE', type: 'boolean', default: true, description: 'show date stamp' },
  { id: 'SHOW_INFO', type: 'boolean', default: false, description: 'show camera and exposure details below date' },
  { id: 'INFO_LINE_GAP', type: 'range-slider', default: 10, min: -200, max: 120, step: 1, description: 'px', visibleWhen: { id: 'SHOW_INFO', value: true, default: false } },
  { id: 'LEFT_INFO_STRIP', type: 'boolean', default: false, description: 'show exposure info on a left black strip' },
  { id: 'PORTRAIT_REVERSE_LAYOUT', type: 'boolean', default: false, description: 'reverse strip/date placement on portrait output', visibleWhen: { id: 'LEFT_INFO_STRIP', value: true, default: false } },
];

const LEFT_INFO_STYLE = {
  stripWidth: 115,
  textColor: '#FF2400',
  textAlpha: 1,
  fontSize: 75,
  glow: true,
  glowColor: '#FF0000',
  glowRadius: 64,
  glowIntensity: 2.35,
  blur: 2.2,
  itemSeparator: '   ',
};

const pad2 = (n: number): string => n.toString().padStart(2, '0');

const isPortraitOutput = (photo: Photo, targetRatio: string): boolean => {
  if (targetRatio === 'free') return photo.image.height > photo.image.width;

  const [width, height] = targetRatio.split(':').map((value) => Number(value));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return photo.image.height > photo.image.width;
  return height > width;
};

type SevenSegmentName = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

const SEVEN_SEGMENTS: Record<string, SevenSegmentName[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  A: ['a', 'b', 'c', 'e', 'f', 'g'],
  B: ['c', 'd', 'e', 'f', 'g'],
  C: ['a', 'd', 'e', 'f'],
  D: ['b', 'c', 'd', 'e', 'g'],
  E: ['a', 'd', 'e', 'f', 'g'],
  F: ['a', 'e', 'f', 'g'],
  G: ['a', 'c', 'd', 'e', 'f'],
  H: ['b', 'c', 'e', 'f', 'g'],
  I: ['b', 'c'],
  J: ['b', 'c', 'd'],
  K: ['b', 'e', 'f', 'g'],
  L: ['d', 'e', 'f'],
  M: ['a', 'b', 'c', 'e', 'f'],
  N: ['c', 'e', 'g'],
  O: ['a', 'b', 'c', 'd', 'e', 'f'],
  P: ['a', 'b', 'e', 'f', 'g'],
  Q: ['a', 'b', 'c', 'f', 'g'],
  R: ['e', 'g'],
  S: ['a', 'c', 'd', 'f', 'g'],
  T: ['d', 'e', 'f', 'g'],
  U: ['b', 'c', 'd', 'e', 'f'],
  V: ['c', 'd', 'e'],
  W: ['b', 'd', 'f'],
  X: ['b', 'c', 'e', 'f', 'g'],
  Y: ['b', 'c', 'd', 'f', 'g'],
  Z: ['a', 'b', 'd', 'e', 'g'],
  o: ['c', 'd', 'e', 'g'],
};

type SegmentMetrics = {
  width: number;
  height: number;
  thickness: number;
  radius: number;
  digitGap: number;
  slant: number;
};

const createSegmentMetrics = (fontSize: number): SegmentMetrics => ({
  width: fontSize * 0.6,
  height: fontSize,
  thickness: fontSize * 0.135,
  radius: fontSize * 0.04,
  digitGap: fontSize * 0.1,
  slant: fontSize * 0.055,
});

const roundedRectPath = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void => {
  const r = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
};

const drawRoundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void => {
  context.beginPath();
  roundedRectPath(context, x, y, width, height, radius);
  context.fill();
};

const drawLampBar = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, direction: 'horizontal' | 'vertical'): void => {
  const cap = direction === 'horizontal' ? height * 0.48 : width * 0.48;

  context.beginPath();
  if (direction === 'horizontal') {
    context.moveTo(x + cap, y);
    context.lineTo(x + width - cap, y);
    context.quadraticCurveTo(x + width - cap * 0.12, y, x + width, y + height / 2);
    context.quadraticCurveTo(x + width - cap * 0.12, y + height, x + width - cap, y + height);
    context.lineTo(x + cap, y + height);
    context.quadraticCurveTo(x + cap * 0.12, y + height, x, y + height / 2);
    context.quadraticCurveTo(x + cap * 0.12, y, x + cap, y);
  } else {
    context.moveTo(x + width / 2, y);
    context.quadraticCurveTo(x + width, y + cap * 0.12, x + width, y + cap);
    context.lineTo(x + width, y + height - cap);
    context.quadraticCurveTo(x + width, y + height - cap * 0.12, x + width / 2, y + height);
    context.quadraticCurveTo(x, y + height - cap * 0.12, x, y + height - cap);
    context.lineTo(x, y + cap);
    context.quadraticCurveTo(x, y + cap * 0.12, x + width / 2, y);
  }
  context.closePath();
  context.fill();
};

const drawSevenSegment = (context: CanvasRenderingContext2D, segment: SevenSegmentName, metrics: SegmentMetrics): void => {
  const { width, height, thickness } = metrics;
  const gap = thickness * 0.58;
  const inset = thickness * 0.9;
  const horizontalWidth = width - thickness * 2.08;
  const halfHeight = height / 2;
  const topVerticalY = thickness + gap;
  const bottomVerticalY = halfHeight + gap;
  const verticalHeight = halfHeight - thickness - gap * 1.65;

  switch (segment) {
    case 'a':
      drawLampBar(context, inset, 0, horizontalWidth, thickness, 'horizontal');
      break;
    case 'b':
      drawLampBar(context, width - thickness, topVerticalY, thickness, verticalHeight, 'vertical');
      break;
    case 'c':
      drawLampBar(context, width - thickness, bottomVerticalY, thickness, verticalHeight, 'vertical');
      break;
    case 'd':
      drawLampBar(context, inset, height - thickness, horizontalWidth, thickness, 'horizontal');
      break;
    case 'e':
      drawLampBar(context, 0, bottomVerticalY, thickness, verticalHeight, 'vertical');
      break;
    case 'f':
      drawLampBar(context, 0, topVerticalY, thickness, verticalHeight, 'vertical');
      break;
    case 'g':
      drawLampBar(context, inset, halfHeight - thickness / 2, horizontalWidth, thickness, 'horizontal');
      break;
  }
};

const SMALL_SHUTTER_ZERO = 'o';

const measureSegmentChar = (char: string, metrics: SegmentMetrics): number => {
  if (char >= '0' && char <= '9') return metrics.width + metrics.digitGap + metrics.slant;
  if (SEVEN_SEGMENTS[char]) return metrics.width + metrics.digitGap + metrics.slant;
  if (char === ' ') return metrics.width * 0.46;
  if (char === "'") return metrics.width * 0.28;
  if (char === '.') return metrics.thickness * 0.9;
  if (char === ':' || char === '-' || char === '/' || char === ',') return metrics.width * 0.38;
  return metrics.width * 0.48;
};

const measureSegmentToken = (token: string, metrics: SegmentMetrics): number =>
  Array.from(token).reduce((width, char) => width + measureSegmentChar(char, metrics), 0);

const drawSegmentChar = (context: CanvasRenderingContext2D, char: string, x: number, y: number, metrics: SegmentMetrics): void => {
  const { width, height, thickness, radius, slant } = metrics;
  const segments = SEVEN_SEGMENTS[char];

  if (segments) {
    context.save();
    context.translate(x + slant, y);
    context.transform(1, 0, -0.13, 1, 0, 0);
    segments.forEach((segment) => drawSevenSegment(context, segment, metrics));
    context.restore();
    return;
  }

  if (char === "'") {
    drawRoundedRect(context, x + slant * 0.6, y + thickness * 0.25, thickness * 0.85, thickness * 1.9, radius);
    return;
  }

  if (char === ':') {
    drawRoundedRect(context, x + thickness * 0.35, y + height * 0.28, thickness * 0.9, thickness * 0.9, radius);
    drawRoundedRect(context, x + thickness * 0.35, y + height * 0.62, thickness * 0.9, thickness * 0.9, radius);
    return;
  }

  if (char === '-') {
    drawRoundedRect(context, x, y + height / 2 - thickness / 2, width * 0.38, thickness, radius);
    return;
  }

  if (char === '.') {
    drawRoundedRect(context, x - width * 0.25, y + height - thickness * 0.9, thickness * 0.9, thickness * 0.9, radius);
    return;
  }

  if (char === ',') {
    drawRoundedRect(context, x + thickness * 0.35, y + height - thickness * 1.25, thickness * 0.9, thickness * 0.9, radius);
    drawRoundedRect(context, x + thickness * 0.5, y + height - thickness * 0.45, thickness * 0.55, thickness * 0.75, radius);
    return;
  }

  if (char === '/') {
    context.save();
    context.translate(x + width * 0.26, y + height * 0.85);
    context.rotate(0.45);
    drawRoundedRect(context, 0, -height * 0.7, thickness * 0.85, height * 0.7, radius);
    context.restore();
  }
};

const drawSegmentToken = (context: CanvasRenderingContext2D, token: string, x: number, y: number, metrics: SegmentMetrics): void => {
  let cursor = x;
  Array.from(token).forEach((char) => {
    drawSegmentChar(context, char, cursor, y, metrics);
    cursor += measureSegmentChar(char, metrics);
  });
};

const createTintedMask = (mask: HTMLCanvasElement, color: string): HTMLCanvasElement => {
  const tinted = document.createElement('canvas');
  tinted.width = mask.width;
  tinted.height = mask.height;

  const context = tinted.getContext('2d')!;
  context.drawImage(mask, 0, 0);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = color;
  context.fillRect(0, 0, tinted.width, tinted.height);

  return tinted;
};

type DotMatrixGlyphs = Record<string, string[]>;

const DOT_MATRIX_GLYPHS: DotMatrixGlyphs = {
  "'": ['110', '110', '010', '100', '000', '000', '000'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '-': ['00000', '00000', '00000', '11110', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '00000', '01100', '00100'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  年: ['01000', '01111', '10010', '01111', '01010', '11111', '00010'],
  月: ['01111', '01001', '01111', '01001', '01111', '01001', '10001'],
  日: ['01111', '01001', '01001', '01111', '01001', '01001', '01111'],
};

const cloneDotMatrixGlyphs = (glyphs: DotMatrixGlyphs): DotMatrixGlyphs => Object.fromEntries(Object.entries(glyphs).map(([key, rows]) => [key, [...rows]]));

const DOT_MATRIX_GLYPH_SETS: Record<string, DotMatrixGlyphs> = {
  default: DOT_MATRIX_GLYPHS,
  'copy-1': cloneDotMatrixGlyphs(DOT_MATRIX_GLYPHS),
  'copy-2': cloneDotMatrixGlyphs(DOT_MATRIX_GLYPHS),
};

type DotMatrixMetrics = {
  dot: number;
  pitch: number;
  height: number;
  radius: number;
  glyphGap: number;
};

const createDotMatrixMetrics = (fontSize: number): DotMatrixMetrics => {
  const dot = fontSize / 9.7;
  return {
    dot,
    pitch: dot * 1.45,
    height: fontSize,
    radius: dot * 0.22,
    glyphGap: dot * 1.2,
  };
};

const measureDotMatrixChar = (char: string, metrics: DotMatrixMetrics, glyphs: DotMatrixGlyphs): number => {
  const glyph = glyphs[char];
  if (!glyph) return metrics.pitch * 3;
  return glyph[0].length * metrics.pitch - (metrics.pitch - metrics.dot) + metrics.glyphGap;
};

const measureDotMatrixToken = (token: string, metrics: DotMatrixMetrics, glyphs: DotMatrixGlyphs): number =>
  Array.from(token).reduce((width, char) => width + measureDotMatrixChar(char, metrics, glyphs), 0);

const drawDotMatrixChar = (context: CanvasRenderingContext2D, char: string, x: number, y: number, metrics: DotMatrixMetrics, glyphs: DotMatrixGlyphs): void => {
  const glyph = glyphs[char];
  if (!glyph) return;

  glyph.forEach((row, rowIndex) => {
    Array.from(row).forEach((cell, columnIndex) => {
      if (cell !== '1') return;
      drawRoundedRect(context, x + columnIndex * metrics.pitch, y + rowIndex * metrics.pitch, metrics.dot, metrics.dot, metrics.radius);
    });
  });
};

const drawDotMatrixToken = (context: CanvasRenderingContext2D, token: string, x: number, y: number, metrics: DotMatrixMetrics, glyphs: DotMatrixGlyphs): void => {
  let cursor = x;
  Array.from(token).forEach((char) => {
    drawDotMatrixChar(context, char, cursor, y, metrics, glyphs);
    cursor += measureDotMatrixChar(char, metrics, glyphs);
  });
};

const drawDotMatrixStamp = (
  context: CanvasRenderingContext2D,
  tokens: string[],
  tokenWidths: number[],
  gap: number,
  metrics: DotMatrixMetrics,
  glyphs: DotMatrixGlyphs,
  baseline: CanvasTextBaseline,
  option: {
    textColor: string;
    textAlpha: number;
    glow: boolean;
    glowColor: string;
    glowRadius: number;
    glowIntensity: number;
    blur: number;
  }
): void => {
  const totalWidth = tokenWidths.reduce((a, b) => a + b, 0) + gap * Math.max(0, tokens.length - 1);
  const maskPadding = Math.ceil(Math.max(option.glowRadius * 2.8, metrics.height * 0.45, 18));
  const mask = document.createElement('canvas');
  mask.width = Math.ceil(totalWidth + maskPadding * 2);
  mask.height = Math.ceil(metrics.height + maskPadding * 2);

  const maskContext = mask.getContext('2d')!;
  maskContext.fillStyle = '#ffffff';
  maskContext.translate(maskPadding, maskPadding);

  let cursor = 0;
  tokens.forEach((token, index) => {
    drawDotMatrixToken(maskContext, token, cursor, 0, metrics, glyphs);
    cursor += tokenWidths[index] + gap;
  });

  const glowMask = createTintedMask(mask, option.glowColor);
  const coreMask = createTintedMask(mask, option.textColor);
  const densityMask = createTintedMask(mask, '#6A5200');
  const drawX = -maskPadding;
  const drawY = baseline === 'top' ? -maskPadding : -metrics.height - maskPadding;
  const intensity = Math.max(0, option.glowIntensity);

  context.save();
  context.imageSmoothingEnabled = false;

  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = Math.min(0.42, option.textAlpha * 0.34);
  context.filter = option.blur > 0 ? `blur(${Math.max(0.2, option.blur * 0.6)}px)` : 'none';
  context.drawImage(densityMask, drawX, drawY);

  if (option.glow && intensity > 0) {
    const passes = [
      { blur: option.glowRadius * 0.9, alpha: 0.2 * intensity },
      { blur: option.glowRadius * 0.35, alpha: 0.36 * intensity },
    ];

    context.globalCompositeOperation = 'source-over';
    passes.forEach((pass) => {
      context.globalAlpha = Math.min(0.62, option.textAlpha * pass.alpha);
      context.filter = pass.blur > 0 ? `blur(${pass.blur}px)` : 'none';
      context.drawImage(glowMask, drawX, drawY);
    });
  }

  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = option.textAlpha;
  context.filter = option.blur > 0 ? `blur(${option.blur}px)` : 'none';
  context.drawImage(coreMask, drawX, drawY);

  context.restore();
};

const drawSegmentLampStamp = (
  context: CanvasRenderingContext2D,
  tokens: string[],
  tokenWidths: number[],
  gap: number,
  metrics: SegmentMetrics,
  baseline: CanvasTextBaseline,
  option: {
    textColor: string;
    textAlpha: number;
    glow: boolean;
    glowColor: string;
    glowRadius: number;
    glowIntensity: number;
    blur: number;
  }
): void => {
  const totalWidth = tokenWidths.reduce((a, b) => a + b, 0) + gap * Math.max(0, tokens.length - 1);
  const maskPadding = Math.ceil(Math.max(option.glowRadius * 3.2, metrics.height * 0.7, 24));
  const mask = document.createElement('canvas');
  mask.width = Math.ceil(totalWidth + maskPadding * 2);
  mask.height = Math.ceil(metrics.height + maskPadding * 2);

  const maskContext = mask.getContext('2d')!;
  maskContext.fillStyle = '#ffffff';
  maskContext.translate(maskPadding, maskPadding);

  let cursor = 0;
  tokens.forEach((token, index) => {
    drawSegmentToken(maskContext, token, cursor, 0, metrics);
    cursor += tokenWidths[index] + gap;
  });

  const glowMask = createTintedMask(mask, option.glowColor);
  const densityMask = createTintedMask(mask, '#8A0D00');
  const coreMask = createTintedMask(mask, option.textColor);
  const heatMask = createTintedMask(mask, '#FFE35A');
  const drawY = baseline === 'top' ? -maskPadding : -metrics.height - maskPadding;
  const drawX = -maskPadding;
  const intensity = Math.max(0, option.glowIntensity);

  context.save();
  context.imageSmoothingEnabled = true;

  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = Math.min(0.46, option.textAlpha * (0.22 + intensity * 0.08));
  context.filter = option.blur > 0 ? `blur(${Math.max(0.2, option.blur * 0.55)}px)` : 'none';
  context.drawImage(densityMask, drawX, drawY);

  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = Math.min(0.28, option.textAlpha * (0.12 + intensity * 0.04));
  context.filter = 'none';
  context.drawImage(densityMask, drawX, drawY);

  if (option.glow && intensity > 0) {
    const visibleHaloPasses = [
      { blur: option.glowRadius * 1.18, alpha: 0.18 * intensity },
      { blur: option.glowRadius * 0.48, alpha: 0.24 * intensity },
    ];

    context.globalCompositeOperation = 'source-over';
    visibleHaloPasses.forEach((pass) => {
      context.globalAlpha = Math.min(0.52, option.textAlpha * pass.alpha);
      context.filter = pass.blur > 0 ? `blur(${pass.blur}px)` : 'none';
      context.drawImage(glowMask, drawX, drawY);
    });

    const passes = [
      { blur: option.glowRadius * 1.8, alpha: 0.34 * intensity },
      { blur: option.glowRadius * 0.74, alpha: 0.62 * intensity },
      { blur: Math.max(option.blur * 4.2, 2.4), alpha: 0.9 * intensity },
    ];

    context.globalCompositeOperation = 'lighter';
    passes.forEach((pass) => {
      context.globalAlpha = Math.min(1, option.textAlpha * pass.alpha);
      context.filter = pass.blur > 0 ? `blur(${pass.blur}px)` : 'none';
      context.drawImage(glowMask, drawX, drawY);
    });
  }

  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = option.textAlpha;
  context.filter = option.blur > 0 ? `blur(${option.blur}px)` : 'none';
  context.drawImage(coreMask, drawX, drawY);

  if (option.glow && intensity > 0) {
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = Math.min(0.72, option.textAlpha * intensity * 0.32);
    context.filter = option.blur > 0 ? `blur(${Math.max(0.2, option.blur * 0.35)}px)` : 'none';
    context.drawImage(heatMask, drawX, drawY);
  }

  context.restore();
};

const formatDate = (date: Date, format: string): string => {
  const YYYY = date.getFullYear().toString();
  const YY = YYYY.slice(-2);
  const M = (date.getMonth() + 1).toString();
  const MM = pad2(date.getMonth() + 1);
  const DD = pad2(date.getDate());
  const HH = pad2(date.getHours());
  const mm = pad2(date.getMinutes());

  switch (format) {
    case "'YY M DD":
      return `'${YY} ${M} ${DD}`;
    case "'YY MM DD":
      return `'${YY} ${MM} ${DD}`;
    case 'YY MM DD':
      return `${YY} ${MM} ${DD}`;
    case 'DD MM YY':
      return `${DD} ${MM} ${YY}`;
    case 'MM DD YY':
      return `${MM} ${DD} ${YY}`;
    case "DD M 'YY":
      return `${DD} ${M} '${YY}`;
    case "'YY年 M月DD日":
      return `'${YY}年 ${M}月${DD}日`;
    case 'YYYY MM DD':
      return `${YYYY} ${MM} ${DD}`;
    case 'YYYY/MM/DD':
      return `${YYYY}/${MM}/${DD}`;
    case 'YYYY-MM-DD':
      return `${YYYY}-${MM}-${DD}`;
    case 'DD HH:MM':
      return `${DD} ${HH}:${mm}`;
    case 'YY MM DD HH:MM':
      return `${YY} ${MM} ${DD} ${HH}:${mm}`;
    case 'DD MM YY HH:MM':
      return `${DD} ${MM} ${YY} ${HH}:${mm}`;
    default:
      return `'${YY} ${M} ${DD}`;
  }
};

const formatLeftInfoShutter = (exposureTime: string): string => {
  const shutter = exposureTime.replace(/s$/i, '').toUpperCase();
  const reciprocal = shutter.match(/^1\/(.+)$/);
  return reciprocal ? reciprocal[1] : shutter;
};

const formatLeftExposureInfo = (photo: Photo): string =>
  [
    formatLeftInfoShutter(photo.exposureTime),
    photo.fNumber,
    photo.exposureBias,
  ]
    .filter(Boolean)
    .join(LEFT_INFO_STYLE.itemSeparator)
    .toUpperCase();

const formatExposureInfo = (photo: Photo): string =>
  [
    photo.focalLength,
    formatLeftInfoShutter(photo.exposureTime),
    photo.fNumber,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

const replaceShutterZerosWithSmallGlyphs = (text: string, photo: Photo): string => {
  const shutter = formatLeftInfoShutter(photo.exposureTime);
  if (!shutter) return text;
  return text.replace(shutter, shutter.replace(/0/g, SMALL_SHUTTER_ZERO));
};

const DATABACK_FUNC: ThemeFunc = (photo: Photo, input: ThemeOptionInput, store: Store) => {
  const DATE_FORMAT = (input.get('DATE_FORMAT') as string).trim();
  const POSITION = (input.get('POSITION') as string).trim();
  const TEXT_COLOR = (input.get('TEXT_COLOR') as string).trim();
  const TEXT_ALPHA = input.get('TEXT_ALPHA') as number;
  const FONT_FAMILY = ((input.get('FONT_FAMILY') as string | undefined) || 'DSEG7Classic-Italic').trim();
  const RENDERING_STYLE = (input.get('RENDERING_STYLE') as string).trim();
  const DOT_MATRIX_FONT = (input.get('DOT_MATRIX_FONT') as string).trim();
  const FONT_SIZE = input.get('FONT_SIZE') as number;
  const SPACE_GAP = input.get('SPACE_GAP') as number;
  const OFFSET_X = input.get('OFFSET_X') as number;
  const OFFSET_Y = input.get('OFFSET_Y') as number;
  const GLOW = input.get('GLOW') as boolean;
  const GLOW_COLOR = (input.get('GLOW_COLOR') as string).trim();
  const GLOW_RADIUS = input.get('GLOW_RADIUS') as number;
  const GLOW_INTENSITY = input.get('GLOW_INTENSITY') as number;
  const BLUR = input.get('BLUR') as number;
  const SHOW_DATE = input.get('SHOW_DATE') as boolean;
  const SHOW_INFO = input.get('SHOW_INFO') as boolean;
  const INFO_LINE_GAP = input.get('INFO_LINE_GAP') as number;
  const LEFT_INFO_STRIP = input.get('LEFT_INFO_STRIP') as boolean;
  const PORTRAIT_REVERSE_LAYOUT = input.get('PORTRAIT_REVERSE_LAYOUT') as boolean;
  const portraitOutput = isPortraitOutput(photo, store.ratio);
  const usePortraitInfoStrip = LEFT_INFO_STRIP && portraitOutput;
  const useTopInfoStrip = usePortraitInfoStrip && PORTRAIT_REVERSE_LAYOUT;
  const useBottomInfoStrip = usePortraitInfoStrip && !PORTRAIT_REVERSE_LAYOUT;

  const canvas = sandbox(photo, {
    targetRatio: store.ratio,
    notCroppedMode: store.notCroppedMode,
    backgroundColor: '#000000',
    padding: {
      top: useTopInfoStrip ? LEFT_INFO_STYLE.stripWidth : 0,
      right: 0,
      bottom: useBottomInfoStrip ? LEFT_INFO_STYLE.stripWidth : 0,
      left: LEFT_INFO_STRIP && !usePortraitInfoStrip ? LEFT_INFO_STYLE.stripWidth : 0,
    },
  });

  const rawDate = overrideExifMetadata()?.takenAt || photo.metadata.takenAt;
  const date = rawDate ? new Date(rawDate) : null;
  const text = date && !isNaN(date.getTime()) ? formatDate(date, DATE_FORMAT) : '';
  if (SHOW_DATE && !text) return canvas;

  const exposureInfoLine = store.disableExposureMeter ? '' : formatExposureInfo(photo);
  const sideInfoLine = store.disableExposureMeter ? '' : replaceShutterZerosWithSmallGlyphs(formatLeftExposureInfo(photo), photo);
  const textLines = [
    ...(SHOW_DATE && text ? [{ text, fontSize: FONT_SIZE, spaceGap: SPACE_GAP, splitSpaces: true }] : []),
    ...(SHOW_INFO && exposureInfoLine ? [{ text: exposureInfoLine, fontSize: FONT_SIZE, spaceGap: SPACE_GAP, splitSpaces: false }] : []),
  ];

  const context = canvas.getContext('2d')!;
  context.fillStyle = TEXT_COLOR;
  context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  context.textAlign = 'left';

  const useSegmentLamp = RENDERING_STYLE === 'segment-lamp';
  const useDotMatrix = RENDERING_STYLE === 'dot-matrix';
  const dotMatrixGlyphs = DOT_MATRIX_GLYPH_SETS[DOT_MATRIX_FONT] ?? DOT_MATRIX_GLYPHS;
  const renderLines = textLines.map((line, lineIndex) => {
    context.font = `${line.fontSize}px ${FONT_FAMILY}`;
    const lineUseSegmentLamp = useSegmentLamp;
    const lineUseDotMatrix = useDotMatrix;
    const segmentMetrics = createSegmentMetrics(line.fontSize);
    const dotMatrixMetrics = createDotMatrixMetrics(line.fontSize);
    const tokens = line.splitSpaces ? line.text.split(' ') : [line.text];
    const naturalSpace = context.measureText(' ').width;
    const gap = lineIndex === 0 ? naturalSpace + line.spaceGap : 0;
    const tokenWidths = tokens.map((tok) => {
      if (lineUseSegmentLamp) return measureSegmentToken(tok, segmentMetrics);
      if (lineUseDotMatrix) return measureDotMatrixToken(tok, dotMatrixMetrics, dotMatrixGlyphs);
      return context.measureText(tok).width;
    });

    return {
      ...line,
      useSegmentLamp: lineUseSegmentLamp,
      useDotMatrix: lineUseDotMatrix,
      tokens,
      tokenWidths,
      gap,
      totalWidth: tokenWidths.reduce((a, b) => a + b, 0) + gap * Math.max(0, tokens.length - 1),
      segmentMetrics,
      dotMatrixMetrics,
      dotMatrixGlyphs,
    };
  });
  const drawLampLine = (line: (typeof renderLines)[number], baseline: CanvasTextBaseline) => {
    if (line.useSegmentLamp) {
      drawSegmentLampStamp(context, line.tokens, line.tokenWidths, line.gap, line.segmentMetrics, baseline, {
        textColor: TEXT_COLOR,
        textAlpha: TEXT_ALPHA,
        glow: GLOW,
        glowColor: GLOW_COLOR,
        glowRadius: GLOW_RADIUS,
        glowIntensity: GLOW_INTENSITY,
        blur: BLUR,
      });
      return;
    }

    if (line.useDotMatrix) {
      drawDotMatrixStamp(context, line.tokens, line.tokenWidths, line.gap, line.dotMatrixMetrics, line.dotMatrixGlyphs, baseline, {
        textColor: TEXT_COLOR,
        textAlpha: TEXT_ALPHA,
        glow: GLOW,
        glowColor: GLOW_COLOR,
        glowRadius: GLOW_RADIUS,
        glowIntensity: GLOW_INTENSITY,
        blur: BLUR,
      });
    }
  };

  if (LEFT_INFO_STRIP && sideInfoLine) {
    const segmentMetrics = createSegmentMetrics(LEFT_INFO_STYLE.fontSize);
    const tokenWidths = [measureSegmentToken(sideInfoLine, segmentMetrics)];
    const totalWidth = tokenWidths[0];

    context.save();
    if (useTopInfoStrip) {
      context.translate((canvas.width - totalWidth) / 2, Math.max(0, (LEFT_INFO_STYLE.stripWidth - LEFT_INFO_STYLE.fontSize) / 2));
    } else if (useBottomInfoStrip) {
      context.translate((canvas.width + totalWidth) / 2, canvas.height - Math.max(0, (LEFT_INFO_STYLE.stripWidth - LEFT_INFO_STYLE.fontSize) / 2));
      context.rotate(Math.PI);
    } else {
      context.translate(Math.max(0, (LEFT_INFO_STYLE.stripWidth - LEFT_INFO_STYLE.fontSize) / 2), (canvas.height + totalWidth) / 2);
      context.rotate(-Math.PI / 2);
    }
    drawSegmentLampStamp(context, [sideInfoLine], tokenWidths, 0, segmentMetrics, 'top', {
      textColor: LEFT_INFO_STYLE.textColor,
      textAlpha: LEFT_INFO_STYLE.textAlpha,
      glow: LEFT_INFO_STYLE.glow,
      glowColor: LEFT_INFO_STYLE.glowColor,
      glowRadius: LEFT_INFO_STYLE.glowRadius,
      glowIntensity: LEFT_INFO_STYLE.glowIntensity,
      blur: LEFT_INFO_STYLE.blur,
    });
    context.restore();
  }

  if (renderLines.length === 0) return canvas;

  const totalWidth = Math.max(...renderLines.map((line) => line.totalWidth));

  context.save();

  const isPortrait = canvas.height > canvas.width;
  let baseline: CanvasTextBaseline = 'bottom';

  if (isPortrait) {
    if (PORTRAIT_REVERSE_LAYOUT) {
      context.translate(OFFSET_Y, canvas.height - OFFSET_X - totalWidth);
      context.rotate(Math.PI / 2);
    } else {
      context.translate(canvas.width - OFFSET_Y, OFFSET_X + totalWidth);
      context.rotate(-Math.PI / 2);
    }
    baseline = 'bottom';
    context.textBaseline = baseline;
  } else {
    let startX: number;
    let y: number;
    switch (POSITION) {
      case 'bottom-left':
        startX = OFFSET_X;
        y = canvas.height - OFFSET_Y;
        baseline = 'bottom';
        break;
      case 'top-right':
        startX = canvas.width - OFFSET_X - totalWidth;
        y = OFFSET_Y;
        baseline = 'top';
        break;
      case 'top-left':
        startX = OFFSET_X;
        y = OFFSET_Y;
        baseline = 'top';
        break;
      case 'bottom-right':
      default:
        startX = canvas.width - OFFSET_X - totalWidth;
        y = canvas.height - OFFSET_Y;
        baseline = 'bottom';
        break;
    }
    context.textBaseline = baseline;
    context.translate(startX, y);
  }

  const alignRight = (isPortrait && !PORTRAIT_REVERSE_LAYOUT) || POSITION.endsWith('right');
  const getLineX = (line: (typeof renderLines)[number]) => (alignRight ? totalWidth - line.totalWidth : 0);
  const getLineY = (lineIndex: number) => {
    if (lineIndex === 0) return 0;
    if (baseline === 'top') {
      return renderLines.slice(0, lineIndex).reduce((offset, line) => offset + line.fontSize + INFO_LINE_GAP, 0);
    }
    return renderLines.slice(1, lineIndex + 1).reduce((offset, line) => offset + line.fontSize + INFO_LINE_GAP, 0);
  };

  const drawFontTokens = (line: (typeof renderLines)[number]) => {
    let cursor = 0;
    for (let i = 0; i < line.tokens.length; i++) {
      context.fillText(line.tokens[i], cursor, 0);
      cursor += line.tokenWidths[i] + line.gap;
    }
  };

  const drawLine = (line: (typeof renderLines)[number], lineIndex: number) => {
    context.save();
    context.translate(getLineX(line), getLineY(lineIndex));
    context.font = `${line.fontSize}px ${FONT_FAMILY}`;

    if (line.useSegmentLamp || line.useDotMatrix) {
      drawLampLine(line, baseline);
      context.restore();
      return;
    }

    if (GLOW) {
      const intensity = Math.max(0, GLOW_INTENSITY);
      context.save();
      context.fillStyle = GLOW_COLOR;
      context.shadowColor = GLOW_COLOR;
      context.globalCompositeOperation = 'lighter';

      const passes = [
        { filterBlur: GLOW_RADIUS * 0.55, shadowBlur: GLOW_RADIUS * 1.45, alphaMul: 0.16 },
        { filterBlur: GLOW_RADIUS * 0.26, shadowBlur: GLOW_RADIUS * 0.9, alphaMul: 0.34 },
        { filterBlur: Math.max(BLUR * 2.2, 1), shadowBlur: GLOW_RADIUS * 0.35, alphaMul: 0.62 },
      ];

      for (const pass of passes) {
        context.globalAlpha = Math.min(1, TEXT_ALPHA * intensity * pass.alphaMul);
        context.shadowBlur = pass.shadowBlur;
        context.filter = pass.filterBlur > 0 ? `blur(${pass.filterBlur}px)` : 'none';
        drawFontTokens(line);
      }

      context.restore();
    }

    context.filter = BLUR > 0 ? `blur(${BLUR}px)` : 'none';
    context.globalAlpha = TEXT_ALPHA;
    context.fillStyle = TEXT_COLOR;
    drawFontTokens(line);

    if (GLOW && GLOW_INTENSITY > 0) {
      context.save();
      context.globalCompositeOperation = 'lighter';
      context.globalAlpha = Math.min(0.35, TEXT_ALPHA * GLOW_INTENSITY * 0.16);
      context.fillStyle = '#FFD0A0';
      context.filter = BLUR > 0 ? `blur(${Math.max(0.2, BLUR * 0.35)}px)` : 'none';
      drawFontTokens(line);
      context.restore();
    }

    context.restore();
  };

  renderLines.forEach((line, index) => drawLine(line, index));

  context.restore();
  return canvas;
};

const DATABACK_PRESETS = [
  {
    name: '#1',
    values: {
      DATE_FORMAT: "'YY M DD",
      POSITION: 'bottom-right',
      TEXT_COLOR: '#FF2400',
      TEXT_ALPHA: 1,
      RENDERING_STYLE: 'segment-lamp',
      DOT_MATRIX_FONT: 'default',
      FONT_SIZE: 75,
      SPACE_GAP: 85,
      OFFSET_X: 450,
      OFFSET_Y: 330,
      GLOW: true,
      GLOW_COLOR: '#FF0000',
      GLOW_RADIUS: 64,
      GLOW_INTENSITY: 2.35,
      BLUR: 2.2,
      SHOW_DATE: false,
      SHOW_INFO: false,
      INFO_LINE_GAP: 10,
      LEFT_INFO_STRIP: true,
      PORTRAIT_REVERSE_LAYOUT: false,
    },
  },
  {
    name: '#2 Dot Matrix',
    values: {
      DATE_FORMAT: "DD M 'YY",
      POSITION: 'bottom-right',
      TEXT_COLOR: '#fbf309',
      TEXT_ALPHA: 0.95,
      RENDERING_STYLE: 'dot-matrix',
      DOT_MATRIX_FONT: 'default',
      FONT_SIZE: 115,
      SPACE_GAP: 55,
      OFFSET_X: 280,
      OFFSET_Y: 280,
      GLOW: true,
      GLOW_COLOR: '#ffde05',
      GLOW_RADIUS: 9.5,
      GLOW_INTENSITY: 4,
      BLUR: 1,
      SHOW_DATE: true,
      SHOW_INFO: false,
      INFO_LINE_GAP: 25,
      LEFT_INFO_STRIP: false,
      PORTRAIT_REVERSE_LAYOUT: false,
    },
  },
  {
    name: '#3 Yellow Matrix',
    values: {
      DATE_FORMAT: "'YY年 M月DD日",
      POSITION: 'bottom-right',
      TEXT_COLOR: '#FFD72A',
      TEXT_ALPHA: 0.95,
      RENDERING_STYLE: 'dot-matrix',
      DOT_MATRIX_FONT: 'default',
      FONT_SIZE: 80,
      SPACE_GAP: 34,
      OFFSET_X: 700,
      OFFSET_Y: 255,
      GLOW: true,
      GLOW_COLOR: '#FFC400',
      GLOW_RADIUS: 5,
      GLOW_INTENSITY: 1.1,
      BLUR: 0.35,
      SHOW_DATE: true,
      SHOW_INFO: false,
      INFO_LINE_GAP: 10,
      LEFT_INFO_STRIP: false,
      PORTRAIT_REVERSE_LAYOUT: false,
    },
  },
];

export { DATABACK_FUNC, DATABACK_OPTIONS, DATABACK_PRESETS };
