module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
      // Module resolver for absolute imports
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@styles': './src/styles',
            '@assets': './src/assets',
            '@store': './src/store',
            '@constants': './src/constants',
            '@config': './src/config',
            '@contexts': './src/contexts',
            '@types': './src/types',
          },
        },
      ],
      // React Native Dotenv for environment variables
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};