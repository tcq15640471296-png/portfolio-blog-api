const jwt = require('jsonwebtoken');

/**
 * Generate a signed JSON Web Token that contains the user's document id.
 * The secret and lifetime come from the .env file (JWT_SECRET / JWT_EXPIRE).
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

module.exports = generateToken;
