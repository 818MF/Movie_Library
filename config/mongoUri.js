/**
 * MONGODB_URI prioritaire ; MONGO_URI accepté comme alias (ex. Atlas).
 */
function getMongoUri() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  return typeof uri === 'string' ? uri.trim() : '';
}

module.exports = { getMongoUri };
