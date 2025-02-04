const crypto = require('crypto');

export const hashString = (string: string) => {
  const shasum = crypto.createHash('sha256');
  shasum.update(JSON.stringify(string));
  const hashedString = shasum.digest('hex');
  return hashedString;
};
