// Learn more https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [projectRoot];

// 2. Let Metro know where to resolve packages and assets
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `node_modules` in the root of the monorepo
config.resolver.disableHierarchicalLookup = true;

// 4. Add `src` to resolver
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      if (name === '@src') {
        return path.join(__dirname, 'src');
      }
      return path.join(process.cwd(), `node_modules/${name}`);
    },
  }
);

module.exports = config;
