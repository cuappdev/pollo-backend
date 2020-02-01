const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const NodemonPlugin = require('nodemon-webpack-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(x => ['.bin'].indexOf(x) === -1)
    .forEach((mod) => {
        nodeModules[mod] = `commonjs ${mod}`;
    });

module.exports = {
    devtool: 'eval',
    entry: ['@babel/polyfill', path.join(__dirname, 'src/server.js')],
    context: __dirname,
    node: {
        __filename: true,
        __dirname: true,
    },
    target: 'node',
    output: {
        path: path.join(__dirname, './build/'),
        filename: 'bundle.js',
    },
    externals: nodeModules,
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /(node_modules)/,
            },
        ],
    },
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less)$/),
        new NodemonPlugin({
            watch: ['./build', './src/server.js'],
            events: {
                start: 'cls || clear && node scripts/notify.js',
            },
            verbose: false,
            restartable: 'rs',
        }),
        new ExtraWatchWebpackPlugin({
            dirs: ['./'],
        }),
    ],
};
