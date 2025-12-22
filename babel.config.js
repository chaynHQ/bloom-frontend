// Babel config only used when CYPRESS_COVERAGE is enabled
// Normal dev/build uses SWC (faster), coverage runs use Babel with istanbul
module.exports = {
  presets: ['next/babel'],
  plugins: process.env.CYPRESS_COVERAGE === 'true' ? ['istanbul'] : [],
};
