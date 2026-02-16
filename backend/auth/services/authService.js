/**
 * Auth service - registration, login, password hashing
 */
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../models/User.js';
import { createToken } from '../../common/middleware/auth.js';

const SALT_ROUNDS = 10;

export async function register(email, password, name = '') {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedName = (name || '').trim();

  if (!trimmedEmail || !password) {
    throw new Error('Email and password are required');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existing = findUserByEmail(trimmedEmail);
  if (existing) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = createUser(trimmedEmail, passwordHash, trimmedName);
  const token = createToken(user.id);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export async function login(email, password) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new Error('Email and password are required');
  }

  const user = findUserByEmail(trimmedEmail);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = createToken(user.id);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}

export function getMe(userId) {
  const user = findUserById(userId);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}
