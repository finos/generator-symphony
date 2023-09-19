const SymADKWebpack = require('@symphony-ui/adk-webpack');
const packageJson = require('./package.json');
const config = {
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  }
};
module.exports = SymADKWebpack(config, packageJson.name);
