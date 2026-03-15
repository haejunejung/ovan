const path = require("node:path")
const { getDefaultConfig } = require("expo/metro-config")

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// Ensure Metro watches the monorepo packages when resolving to source
config.watchFolders = [monorepoRoot]

// Resolve workspace packages to source so changes in packages/*/src are reflected without build
config.resolver = {
  ...config.resolver,
  resolveRequest(context, moduleName, platform) {
    if (moduleName === "@ovan/core") {
      return {
        type: "sourceFile",
        filePath: path.join(monorepoRoot, "packages/core/src/index.ts"),
      }
    }
    if (moduleName === "@ovan/react-native") {
      return {
        type: "sourceFile",
        filePath: path.join(monorepoRoot, "packages/react-native/src/index.ts"),
      }
    }
    return context.resolveRequest(context, moduleName, platform)
  },
}

module.exports = config
