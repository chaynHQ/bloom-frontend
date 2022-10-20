// {
//   "presets": ["next/babel"],
//   "plugins": ["istanbul"]
// }

const shouldInstrumentCode = 'INSTRUMENT_CODE' in process.env;
console.log('shouldInstrumentCode', shouldInstrumentCode);

module.exports = {
  presets: ['next/babel'],
  plugins: shouldInstrumentCode ? ['istanbul'] : [],
};

console.dir(module.exports, { depth: null });
