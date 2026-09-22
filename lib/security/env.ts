export function validateSecret(name: string, value: string | undefined) {
  if (!value) {
    return { valid: false, error: `${name} is not configured.` };
  }

  if (value.length < 24) {
    return { valid: false, error: `${name} must be at least 24 characters.` };
  }

  return { valid: true };
}
