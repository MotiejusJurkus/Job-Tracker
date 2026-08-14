import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const ALGORITHM = 'scrypt';
const HASH_PARTS = 3;
const SALT_BYTES = 16;
const KEY_BYTES = 64;

const deriveKey = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_BYTES, (error, key) => {
      if (error !== null) {
        reject(error);
        return;
      }

      resolve(key);
    });
  });

const decodeBase64 = (value: string): Buffer | undefined => {
  const buffer = Buffer.from(value, 'base64');

  if (buffer.toString('base64') !== value) {
    return undefined;
  }

  return buffer;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(password, salt);

  return `${ALGORITHM}:${salt.toString('base64')}:${key.toString('base64')}`;
};

export const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  const parts = storedHash.split(':');

  if (parts.length !== HASH_PARTS || parts.at(0) !== ALGORITHM) {
    return false;
  }

  const encodedSalt = parts.at(1);
  const encodedKey = parts.at(2);

  if (encodedSalt === undefined || encodedKey === undefined) {
    return false;
  }

  const salt = decodeBase64(encodedSalt);
  const expectedKey = decodeBase64(encodedKey);

  if (
    salt === undefined ||
    expectedKey === undefined ||
    salt.length !== SALT_BYTES ||
    expectedKey.length !== KEY_BYTES
  ) {
    return false;
  }

  const actualKey = await deriveKey(password, salt);

  return timingSafeEqual(actualKey, expectedKey);
};
