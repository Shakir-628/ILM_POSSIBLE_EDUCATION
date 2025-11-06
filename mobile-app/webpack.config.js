const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['react-native-paper'],
      },
    },
    argv
  );

  // Add alias to resolve the icon module warning
  config.resolve.alias = {
    ...config.resolve.alias,
    '@react-native-vector-icons/material-design-icons': '@expo/vector-icons/MaterialCommunityIcons',
  };

  // Suppress the specific warning
  if (!config.ignoreWarnings) {
    config.ignoreWarnings = [];
  }
  
  config.ignoreWarnings.push({
    module: /MaterialCommunityIcon\.js/,
    message: /Can't resolve '@react-native-vector-icons\/material-design-icons'/,
  });

  return config;
};

