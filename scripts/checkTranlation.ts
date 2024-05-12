import fs from 'node:fs'
import * as path from 'path'

const languages = ['de', 'en', 'es', 'fr', 'hi', 'pt'] as const
type Lang = typeof languages[number]

const getKeys = (file: any, keys?: Set<string>, prefix = '') => {
  keys ??= new Set();
  for (const key of Object.keys(file)) {
    if (typeof file[key] === 'object') {
      getKeys(file[key], keys, key)
    }
    else {
      keys.add(prefix ? prefix + '.' + key : key)
    }
  }
  return keys
}

const getFileByPath = (dir: string, fileName: string) => {
  const filePath = path.join(__dirname, '..', 'messages', dir, fileName);
  return require(filePath)
}

const directories = fs.readdirSync(path.join(__dirname, '..', 'messages'));

for (const directory of directories) {
  if (languages.includes(directory as Lang)) continue;

  const files = fs.readdirSync(
    path.join(__dirname, '..', 'messages', directory)
  );

  const langFiles = files.filter(file => languages.includes(file.split('.')[0] as Lang));

  if (langFiles.length !== languages.length) {
    console.warn(`Missing translation files for directory ${directory}:`,
      languages.filter(lang => !langFiles.includes(lang + '.json')));
    continue;
  }

  let expectedKeys: Set<string> = new Set();
  for (const langFile of langFiles) {
    const file = getFileByPath(directory, langFile)
    const prevLen = expectedKeys.size
    const newKeys = getKeys(file)
    const newLen = newKeys.size
    if (newLen > prevLen) {
      expectedKeys = newKeys
    }
  }

  for (const langFile of langFiles) {
    const filePath = path.join(__dirname, '..', 'messages', directory, langFile);
    const currKeys = getKeys(require(filePath))

    if (expectedKeys.size !== currKeys.size) {
      console.log(`${directory}/${langFile} file is missing required keys: ${Array.from(expectedKeys).filter(key => !currKeys.has(key))}`);
    }
  }
}
