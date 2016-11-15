var path = require('path');
var webpack = require('webpack');
var directory = path.join(__dirname, 'public/javascripts/react_elements/');

module.exports = {
  entry: {
    index: path.join(directory, 'frontPage/index'),
    editor: path.join(directory, 'app')
  },
  devtool: 'eval',
  output: {
    path: __dirname,
    filename: '[name].js',
    publicPath: '/javascripts/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: directory
    }]
  }
};