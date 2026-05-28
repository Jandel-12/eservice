const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pages = ['index', 'register', 'resident', 'admin'];

module.exports = {
  mode: 'development',
  entry: pages.reduce((entries, page) => {
    entries[page] = path.resolve(__dirname, `src/pages/${page}.js`);
    return entries;
  }, {}),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    ...pages.map(page => new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `src/pages/${page}.html`),
      filename: `${page}.html`,
      chunks: [page],
    })),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
