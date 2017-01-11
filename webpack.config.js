const webpack = require("webpack");
const config = require('./config/server.config');
const router = config.router || [];
const proxys = config.proxys || [];
const PATHS = config.PATHS || {};
const entry = PATHS.entry || {};
const output = PATHS.output || {};

const _proxys = {};
for (var i = 0; i < proxys.length; i++) {
  _proxys[proxys[i].path] = {
    target: proxys[i].host,
    secure: false
  };
}
// for (var i = 0; i < router.length; i++) {
//   _proxys[router[i].route] = {
//     target: router[i].route,
//     secure: false,
//     bypass: router[i].handle,
//   };
// }
// console.log(_proxys);
module.exports = {
  context: __dirname + "/src",
  entry: {
    app: entry.js
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].bundle.js",
    publicPath: "/dist"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
            loader: "babel-loader",
            options: { presets: ["es2015"] }
        }]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ]
  },
  devServer: {
    port: config.port,
    contentBase: __dirname + "/src",
    proxy: _proxys,
  }
};
