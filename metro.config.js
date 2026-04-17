const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

function escapeForRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function blockPath(relativePath) {
  const absolutePath = path.resolve(__dirname, relativePath);
  const normalized = escapeForRegex(absolutePath).replace(/[\\/]+/g, '[\\\\/]');
  return new RegExp(`^${normalized}([\\\\/].*)?$`);
}

config.resolver.blockList = [
  blockPath('android/app/.cxx'),
  blockPath('android/app/build'),
  blockPath('android/build'),
  blockPath('ios/build'),
];

// Fix OkHttp chunked-encoding issue on Android emulator (RN New Architecture)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    res.setHeader('Transfer-Encoding', 'identity');
    return middleware(req, res, next);
  },
};

module.exports = config;
