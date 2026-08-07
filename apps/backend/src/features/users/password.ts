import { randomBytes, scrypt } from 'node:crypto';

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

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(password, salt);

  return `scrypt:${salt.toString('base64')}:${key.toString('base64')}`;
};
