const generateToken = (length) => Math.random().toString(20).substring(2, length);

const validateTokens = () => {
  const tokens = generateToken(16);
  if (tokens.length < 16) {
    const value = (16 - tokens.length) + 2;
    const newToken = generateToken(value);
    const token = tokens + newToken;
    return token;
  }
  return tokens;
};

module.exports = validateTokens;