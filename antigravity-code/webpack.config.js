const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipWebpackPlugin = require("zip-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: "./src/main.ts",
    target: "web",
    devtool: isProd ? false : "source-map",
    output: {
      path: path.resolve(__dirname, "build/dist"),
      filename: "main.js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: "media", to: "media" },
          { from: "plugin.json", to: "../plugin.json" },
          { from: "readme.md", to: "../readme.md" },
          { from: "changelogs.md", to: "../changelogs.md" },
          { from: "icon.png", to: "../icon.png" },
        ],
      }),
      new ZipWebpackPlugin({
        path: path.resolve(__dirname, "build"),
        filename: "dist.zip",
        pathMapper: (assetPath) => path.join("dist", assetPath),
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, "build"),
      port: 3000,
      headers: { "Access-Control-Allow-Origin": "*" },
    },
  };
};
