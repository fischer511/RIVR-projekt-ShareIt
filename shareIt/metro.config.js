const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver = config.resolver || {};

// Map path aliases used in tsconfig (`@src/*`, `@/*`) so Metro can resolve them.
config.resolver.extraNodeModules = Object.assign({}, config.resolver.extraNodeModules, {
  '@src': path.resolve(projectRoot, 'src'),
  '@': path.resolve(projectRoot),
});

// Also watch the project root so local packages are picked up correctly.
config.watchFolders = config.watchFolders || [];
if (!config.watchFolders.includes(projectRoot)) {
  config.watchFolders.push(projectRoot);
}

module.exports = config;
