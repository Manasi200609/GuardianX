// src/bootstrap.js
// Ensure theme globals are set before other modules initialize
const themeModule = require('./utils/theme');
const theme = themeModule && (themeModule.default || themeModule);
const { COLORS, SPACING, FONT } = theme || {};

global.COLORS = COLORS || global.COLORS || {};
global.SPACING = SPACING || global.SPACING || {};
global.FONT = FONT || global.FONT || {};
global.THEME = theme || global.THEME || {};

module.exports = {
  COLORS: global.COLORS,
  SPACING: global.SPACING,
  FONT: global.FONT,
  THEME: global.THEME,
};
