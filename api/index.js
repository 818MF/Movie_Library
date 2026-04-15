/**
 * Point d'entrée Vercel (serverless). Ne pas appeler app.listen ici.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');
const { getMongoUri } = require('../config/mongoUri');

async function connectMongoIfNeeded() {
  if (process.env.ENABLE_MONGODB === 'false') return;
  if (mongoose.connection.readyState >= 1) return;
  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MONGODB_URI or MONGO_URI is required when ENABLE_MONGODB is not false');
  }
  await mongoose.connect(uri);
}

module.exports = async (req, res) => {
  try {
    await connectMongoIfNeeded();
    return app(req, res);
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: 'Service unavailable', detail: err.message });
  }
};
