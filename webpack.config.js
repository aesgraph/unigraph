const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.module\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false,
                localIdentName: "[name]__[local]___[hash:base64:5]",
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      {
        test: /\.(png|jpe?g|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.xml$/,
        use: [
          {
            loader: "xml-loader",
            options: {
              explicitChildren: false,
              explicitCharkey: false,
              trim: true,
              normalize: true,
              explicitRoot: false,
              emptyTag: null,
            },
          },
        ],
      },
      // Handle Web Workers
      {
        test: /\.worker\.ts$/,
        use: {
          loader: "worker-loader",
          options: {
            inline: "no-fallback",
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".png", ".xml"],
    modules: ["src", "node_modules"],
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(dotenv.config().parsed),
    }),
    new ESLintPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000,
  },
};
