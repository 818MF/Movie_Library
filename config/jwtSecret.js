/**
 * Secret JWT — obligatoire (définir JWT_SECRET dans .env ou sur Vercel).
 */
function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s == null || String(s).trim() === '') {
    throw new Error(
      'JWT_SECRET is missing or empty. Add JWT_SECRET to .env (local) or Project Settings → Environment Variables (Vercel).'
    );
  }
  return String(s).trim();
}

module.exports = { getJwtSecret };
