var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');
var Clean = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var stylelint = require('stylelint');

var pkg = require('./package.json');

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

process.env.BABEL_ENV = TARGET;

var common = {
  entry: PATHS.app,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    preLoaders: [
      {
        test: /\.css$/,
        loaders: ['postcss'],
        include: PATHS.app
      },
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        include: PATHS.app
      },
      {
        test: /\.jsx?$/,
        loaders: ['eslint', 'jscs'],
        include: PATHS.app
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: PATHS.app
      }
    ]
  },
  postcss: function () {
    return [stylelint({
      rules: {
        'block-no-empty': 2,
        'color-no-invalid-hex': 2,
        'declaration-colon-space-after': [2, 'always'],
        'declaration-colon-space-before': [2, 'never'],
        'function-comma-space-after': [2, 'always'],
        'function-url-quotes': [2, 'double'],
        'media-feature-colon-space-after': [2, 'always'],
        'media-feature-colon-space-before': [2, 'never'],
        'media-feature-name-no-vendor-prefix': 2,
        'no-multiple-empty-lines': 2,
        'number-leading-zero': [2, 'never'],
        'number-no-trailing-zeros': 2,
        'property-no-vendor-prefix': 2,
        'rule-no-duplicate-properties': 2,
        'rule-no-single-line': 2,
        'rule-trailing-semicolon': [2, 'always'],
        'selector-list-comma-newline-after': [2, 'always-multi-line'],
        'selector-no-id': 2,
        'string-quotes': [2, 'double'],
        'value-no-vendor-prefix': 2
      }
    })];
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Kanban app'
    })
  ]
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      // display only errors to reduce the amount of output
      stats: 'errors-only',

      // parse host and port from env so this is easy
      // to customize
      host: process.env.HOST,
      port: process.env.PORT
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: PATHS.app
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

if(TARGET === 'build' || TARGET === 'stats' || TARGET === 'deploy') {
  module.exports = merge(common, {
    entry: {
      app: PATHS.app,
      vendor: Object.keys(pkg.dependencies)
    },
    output: {
      path: PATHS.build,
      filename: '[name].[chunkhash].js?'
    },
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: PATHS.app
        }
      ]
    },
    plugins: [
      new Clean(['build']),
      new ExtractTextPlugin('styles.[chunkhash].css'),
      new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        '[name].[chunkhash].js'
      ),
      new webpack.DefinePlugin({
          // This affects react lib size
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}