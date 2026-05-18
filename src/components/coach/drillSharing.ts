function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharedPayload(payload: unknown) {
  return encodeBase64Url(JSON.stringify(payload));
}

function sanitizeSharedValue(value: string) {
  const match = value.trim().match(/^[A-Za-z0-9\-_]+/);
  return match?.[0] ?? value.trim();
}

export function decodeSharedPayload<T>(value: string): T | null {
  try {
    return JSON.parse(decodeBase64Url(sanitizeSharedValue(value))) as T;
  } catch {
    return null;
  }
}
