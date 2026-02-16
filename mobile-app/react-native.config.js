/**
 * React Native CLI configuration.
 *
 * Used by the React Native CLI and auto-linking for native module discovery.
 * Reference: https://github.com/react-native-community/cli/blob/main/docs/configuration.md
 */
module.exports = {
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  assets: [
    // Custom font directories — add paths here if bundling local fonts
    // './src/assets/fonts',
  ],
  dependencies: {
    // Override auto-linking for specific packages if needed.
    // Example: disable a package that self-links incorrectly:
    // 'some-package': { platforms: { ios: null } },
  },
};
