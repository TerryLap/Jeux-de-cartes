async function digestText(value: string): Promise<string> {
  const payload = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  const bytes = Array.from(new Uint8Array(digest));

  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function hashPassword(password: string): Promise<string> {
  return digestText(password.trim());
}
