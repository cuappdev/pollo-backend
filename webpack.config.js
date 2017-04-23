const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'app', 'App.js'),
  output: {
    path: path.join(__dirname, 'public', 'js'),
    filename: 'bundle.js'
  },
  devServer: {
    publicPath: '/js',
    port: 5000,
    proxy: {
      '*': 'http://localhost:8080'
    },
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: 'babel_cache',
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    })
  ]
};
