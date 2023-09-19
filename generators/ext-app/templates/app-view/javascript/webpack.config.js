const SymADKWebpack = require('@symphony-ui/adk-webpack');
const packageJson = require('./package.json');
const config = {
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader"
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
    extensions: ['.js', '.jsx'],
  }
};
module.exports = SymADKWebpack(config, packageJson.name);
