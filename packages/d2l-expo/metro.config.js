// We were getting the error:
//     Android Bundling failed 6247ms
//     While trying to resolve module `@apollo/client` from file ..., the package ... was successfully found. However, this package itself specifies a `main` module field that could not be resolved
// This file is a workaround
// See: https://stackoverflow.com/questions/70071602/main-module-field-cannot-be-resolved-after-installing-apollo-client

const { getDefaultConfig } = require("metro-config");
const { resolver: defaultResolver } = getDefaultConfig.getDefaultValues();
exports.resolver = {
  ...defaultResolver,
  sourceExts: [
    ...defaultResolver.sourceExts,
    "cjs",
  ],
};
