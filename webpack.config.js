const webpack = require("webpack");
const path = require('path');
const Mock = require('mockjs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const serverConfig = require('./config/server.config');
const webpackConfig = require('./config/_config');
const PATHS = webpackConfig.PATHS;
const proxys = {};

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV = 'production') {

}

serverConfig.proxys.dev.map(function (item) {
  proxys[item.path] = {
    target: item.host,
    pathRewrite: item.pathRewrite,
    changeOrigin: true
  };
});

serverConfig.router.dev.map(function (item) {
  proxys[item.route] = {
    secure: false,
    bypass: function(req, res, opt){
      if(req.path.indexOf(item.route) !== -1){
        if (item.mockData) {
          const data = Mock.mock(item.mockData);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return;
        }
        item.handle ? item.handle(req, res) : null;
      }
      return req.path;
    }
  };
});
const entry = PATHS.entry || {};
module.exports = {
  context: __dirname + "/src",
  entry: entry,
  output: {
    path: __dirname + "/dist",
    filename: "[name]bundle.js",
    publicPath: "/",
  },
  resolve: {
    // 加快搜索速度
    modules: [path.resolve(__dirname, 'node_modules')],
    // 加快编译速度
    alias: {
      'react': 'react/dist/react.js',
      'react-dom': 'react-dom/dist/react-dom.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { modules: true } },
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'less-loader'
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html',
      hash: true,
      minify: {
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        collapseWhitespace:true
      }
    }),
    new CopyWebpackPlugin([{
      from: __dirname + '/src/assets/libs',
      to: 'assets/libs'
    }])
  ],
  devServer: {
    port: webpackConfig.port,
    contentBase: __dirname + "/src",
    proxy: proxys,
    historyApiFallback: true,
    hot: true,
    inline: true,
    stats: { colors: true },
  },
};
