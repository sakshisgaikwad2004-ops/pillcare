// auth.js - Secure authentication using Node.js built-in crypto
const crypto = require('node:crypto');
const { db } = require('./db');

// In-memory active sessions map: token -> { username, role, expiresAt }
const activeSessions = new Map();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Hash password with PBKDF2
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        hash: derivedKey.toString('hex'),
        salt: salt
      });
    });
  });
}

// Synchronous PBKDF2 for deterministic setup/testing
function hashPasswordSync(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// Verify password against stored hash and salt
function verifyPasswordSync(password, storedHash, salt) {
  const { hash } = hashPasswordSync(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// Ensure default admin user exists
function bootstrapAdmin() {
  const defaultUser = process.env.ADMIN_USERNAME || 'admin';
  const defaultPass = process.env.ADMIN_PASSWORD || 'pillcare2026!';

  const existing = db.prepare('SELECT id, username FROM admin_users WHERE username = ?').get(defaultUser);
  if (!existing) {
    const { hash, salt } = hashPasswordSync(defaultPass);
    db.prepare(`
      INSERT INTO admin_users (username, passwordHash, salt, role)
      VALUES (?, ?, ?, 'admin')
    `).run(defaultUser, hash, salt);
    console.log(`[AUTH] Default admin account initialized: username '${defaultUser}'`);
  }
}

// Generate secure session token
function createSession(username, role = 'admin') {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  activeSessions.set(token, { username, role, expiresAt });
  return { token, expiresAt };
}

// Verify token
function verifySession(token) {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

// Invalidate token
function invalidateSession(token) {
  if (token) {
    activeSessions.delete(token);
  }
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}, 60 * 60 * 1000).unref();

bootstrapAdmin();

module.exports = {
  hashPasswordSync,
  verifyPasswordSync,
  createSession,
  verifySession,
  invalidateSession
};
