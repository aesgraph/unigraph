#!/bin/bash

# Remove webpack-related dependencies
npm uninstall webpack webpack-cli webpack-dev-server
npm uninstall html-webpack-plugin css-loader style-loader ts-loader
npm uninstall eslint-webpack-plugin copy-webpack-plugin
npm uninstall svg-inline-loader worker-loader file-loader raw-loader

# Install Vite and related plugins
npm install --save-dev vite @vitejs/plugin-react
npm install --save-dev vite-plugin-eslint vite-plugin-static-copy
npm install --save-dev vite-plugin-svg-icons @vitejs/plugin-react-swc
npm install --save-dev vite-plugin-css-modules

echo "Dependencies updated for Vite migration"
