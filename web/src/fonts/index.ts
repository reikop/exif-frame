enum Font {
  Digital7 = 'digital-7',
  Digital7Italic = 'digital-7-italic',
  Poxel = 'poxel',
  DINAlternateBold = 'din-alternate-bold',
  Pretendard = 'pretendard',
  DSEG7ClassicItalic = 'DSEG7Classic-Italic',
  DSEG7ClassicLightItalic = 'DSEG7Classic-LightItalic',
  DSEG7ClassicBoldItalic = 'DSEG7Classic-BoldItalic',
  DSEG7ModernItalic = 'DSEG7Modern-Italic',
  DSEG14ClassicItalic = 'DSEG14Classic-Italic',
  NewXDigitalCursive = 'new-x-digital-cursive',
  NewXDigital = 'new-x-digital',
  NewXDigitalHollow = 'new-x-digital-hollow',
  NewXDigitalLight = 'new-x-digital-light',
}

// Load all fonts from the fonts public/fonts folder
Object.values(Font).forEach((font) => new FontFace(font, `url(fonts/${font}.ttf)`).load().then((loadedFont) => document.fonts.add(loadedFont)));

export default Font;
