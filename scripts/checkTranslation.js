const fs = require('node:fs');
const path = require('path');

const languages = ['de', 'en', 'es', 'fr', 'hi', 'pt'];

const getKeys = (file, keys, prefix = '') => {
  keys ??= new Set();
  for (const key of Object.keys(file)) {
    if (typeof file[key] === 'object') {
      getKeys(file[key], keys, key);
    } else {
      keys.add(prefix ? prefix + '.' + key : key);
    }
  }
  return keys;
};

const getFileByPath = (dir, fileName) => {
  const filePath = path.join(__dirname, '..', 'messages', dir, fileName);
  return require(filePath);
};

const directories = fs.readdirSync(path.join(__dirname, '..', 'messages'));

for (const directory of directories) {
  if (languages.includes(directory)) continue;

  const files = fs.readdirSync(path.join(__dirname, '..', 'messages', directory));

  const langFiles = files.filter((file) => languages.includes(file.split('.')[0]));

  if (langFiles.length !== languages.length) {
    console.warn(
      `Missing translation files for directory ${directory}:`,
      languages.filter((lang) => !langFiles.includes(lang + '.json')),
    );
    continue;
  }

  let expectedKeys = new Set();
  for (const langFile of langFiles) {
    const file = getFileByPath(directory, langFile);
    const prevLen = expectedKeys.size;
    const newKeys = getKeys(file);
    const newLen = newKeys.size;
    if (newLen > prevLen) {
      expectedKeys = newKeys;
    }
  }

  for (const langFile of langFiles) {
    const filePath = path.join(__dirname, '..', 'messages', directory, langFile);
    const currKeys = getKeys(require(filePath));

    if (expectedKeys.size !== currKeys.size) {
      console.log(
        `${directory}/${langFile} file is missing required keys: ${Array.from(expectedKeys).filter(
          (key) => !currKeys.has(key),
        )}`,
      );
    }
  }
}
