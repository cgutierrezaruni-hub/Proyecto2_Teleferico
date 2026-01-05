const db = require('../config/database');

async function upsert(email, code, expiresAt) {
  const q = `
    INSERT INTO password_resets (email, code, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE
      SET code = EXCLUDED.code,
          expires_at = EXCLUDED.expires_at
  `;
  await db.query(q, [email, code, expiresAt]);
}

async function findByEmail(email) {
  const q = `SELECT email, code, expires_at FROM password_resets WHERE email = $1`;
  const { rows } = await db.query(q, [email]);
  return rows[0] || null;
}

async function deleteByEmail(email) {
  const q = `DELETE FROM password_resets WHERE email = $1`;
  await db.query(q, [email]);
}

module.exports = { upsert, findByEmail, deleteByEmail };