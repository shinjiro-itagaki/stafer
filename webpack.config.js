const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { Parser, DomHandler } = require('htmlparser2');
const fs = require('fs');
const { JSDOM } = require("jsdom");

const html = "index.html";
const js   = "index.js";


class MyPlugin {
  apply (compiler) {
    // compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
//    compiler.hooks.assetEmitted.tap('MyPlugin',  (file, { content, source, outputPath, compilation, targetPath }) => {
//    compiler.hooks.afterEmit.tap('MyPlugin',  (compiration) => {
    // console.log(compiler.hooks);
    compiler.hooks.done.tap('MyPlugin',  (stats) => {
      const compiration = stats.compilation;
//      console.log(stats);
//      console.log(compiration);
//      console.log(compiration.assetsInfo);
//      console.log(compiration.mainTemplate);
      const outdir = compiration.mainTemplate._outputOptions.path;
      const htmlpath = outdir + "/" + html;
      const data = fs.readFileSync(htmlpath);
      if(data) {
        const jsdom = new JSDOM(data);
        jsdom.window.document.querySelectorAll('script').forEach(function(tag){
          // console.log(tag);
          const src = tag.src;
          const jspath = outdir + "/" + src;
          const stats = fs.statSync(jspath);
          if(stats.isFile()){
            tag.text = fs.readFileSync(jspath);
            tag.removeAttribute("src");
          }
        });
        fs.writeFileSync(htmlpath,jsdom.serialize());
      } else {
        console.log(err);
      }
    });
  }
}

module.exports = {
  watch: false,
  // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
  mode: 'development',
  // エントリーポイントの設定
  entry: './src/index.ts',
  // 出力の設定
  output: {
    // 出力するファイル名
    filename: js,
    // 出力先のパス（絶対パスを指定する必要がある）
    path: path.join(__dirname, 'public')
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js" , ".css"]
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.html$/, loader: "html-loader" }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./html/" + html
    }),
    new MyPlugin()
  ]
};
