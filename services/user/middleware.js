const jwt = require('jsonwebtoken');
const User = require('./model');
const { getJwtSecret } = require('../../config/jwtSecret');

const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ message: 'Please authenticate.' });
    }
    const token = match[1].trim();
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = decoded.id || decoded._id;
    const user = await User.findOne({ _id: userId, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

module.exports = auth;