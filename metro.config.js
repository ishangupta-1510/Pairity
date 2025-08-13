const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom resolver options
config.resolver = {
  ...config.resolver,
  // Add support for additional file extensions
  assetExts: [...config.resolver.assetExts, 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'],
  sourceExts: [...config.resolver.sourceExts, 'svg', 'mjs'],
  // Configure module resolution
  extraNodeModules: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@navigation': path.resolve(__dirname, 'src/navigation'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@styles': path.resolve(__dirname, 'src/styles'),
    '@assets': path.resolve(__dirname, 'src/assets'),
    '@store': path.resolve(__dirname, 'src/store'),
    '@constants': path.resolve(__dirname, 'src/constants'),
    '@config': path.resolve(__dirname, 'src/config'),
    '@contexts': path.resolve(__dirname, 'src/contexts'),
    '@types': path.resolve(__dirname, 'src/types'),
  },
};

// Add transformer options
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  minifierConfig: {
    keep_fnames: true,
    keep_classnames: true,
  },
};

// Optimize for production
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    ...config.transformer.minifierConfig,
    mangle: {
      keep_fnames: false,
      keep_classnames: false,
    },
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  };
}

// Configure watchman
config.watchFolders = [path.resolve(__dirname)];

// Configure server options
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add custom headers if needed
      res.setHeader('X-Custom-Header', 'Pairity');
      return middleware(req, res, next);
    };
  },
};

// Reset cache on file changes
config.resetCache = true;

module.exports = config;