import { randomBytes } from 'crypto';

export function genId() {
  function generateUUID() {
    const uuid = [];
    for (let i = 0; i < 4; i++) {
      uuid.push(randomBytes(4).toString('hex'));
    }
    return uuid.join('-');
  }

  const uuid = generateUUID();
  return uuid;
}
