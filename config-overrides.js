const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    url: require.resolve("url/"), // Add polyfill for 'url'
    os: require.resolve("os-browserify/browser"), // Add polyfill for 'os'
    http: require.resolve("stream-http"), // Add polyfill for 'http'
    https: require.resolve("https-browserify"), // Add polyfill for 'https'
    assert: require.resolve("assert/"), // Add polyfill for 'assert'
    buffer: require.resolve("buffer/"), // Add polyfill for 'buffer'
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  return config;
};
