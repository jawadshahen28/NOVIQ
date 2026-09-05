import bcrypt from 'bcryptjs';

export const passwordRequirements =
  'Password must be at least 8 characters and include at least one letter and one number';

const passwordMinLength = 8;
const passwordSaltRounds = 12;

export function validatePasswordStrength(password: string) {
  const errors: string[] = [];

  if (password.length < passwordMinLength) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must include at least one letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number');
  }

  return errors;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, passwordSaltRounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
