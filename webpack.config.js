const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const ESLintPlugin = require("eslint-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DocsDirectoryPlugin = require("./scripts/DocsDirectoryPlugin");

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
      {
        test: /\.csv$/,
        include: path.resolve(__dirname, "public/data"),
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "data/",
            },
          },
        ],
      },
      // Handle Web Workers
      {
        test: /\.worker\.(js|ts)$/, // Support both .worker.js and .worker.ts
        use: {
          loader: "worker-loader",
          options: {
            inline: "no-fallback",
          },
        },
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
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          to: "",
          globOptions: {
            ignore: ["**/index.html"], // Avoid overwriting index.html if it's handled separately
          },
        },
        {
          from: "docs",
          to: "docs",
        },
      ],
    }),
    new DocsDirectoryPlugin({
      docsPath: path.resolve(__dirname, "docs"),
      outputPath: path.resolve(__dirname, "docs/docs-structure.json"),
      throttleTime: 30000, // Only rebuild at most once per 30 seconds
      watchForChanges: true,
      includeFiles: true, // Include files in the docs structure
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, "public"),
        publicPath: "/", // serve at root
      },
      {
        directory: path.resolve(__dirname, "dist"),
      },
      {
        directory: path.resolve(__dirname, "docs"),
        publicPath: "/docs",
      },
    ],
    port: 3000,
    historyApiFallback: true,
  },
};
