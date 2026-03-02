module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    // ⚠️ NativeWind v4 NON usa più il plugin babel — solo jsxImportSource
  };
};
