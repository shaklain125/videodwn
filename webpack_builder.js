const webpack = require('webpack');
const path = require('path');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

/**
 * @typedef {webpack.Configuration} Config
 */

class WebpackBuilder {
  constructor() {
    this.excludedFolders = ['node_modules', 'bower_components'];
    this.uglifyParam = {};
    this._header_set = false;
    this._header = null;
    this._scopedCssRule = false;
    this._assetsPath = null;
    this._uglifyJS = true;

    /**
     * @type {Config}
     */
    this._conf = {
      mode: 'production',
      entry: '',
      output: {
        path: '',
        filename: '',
      },
      optimization: {
        minimizer: [],
      },
      module: {
        rules: [],
      },
      plugins: [],
      devServer: {},
      resolve: {
        alias: {},
      },
      watch: false,
      watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /node_modules/,
      },
    };
  }

  /**
   *
   * @param {Config['entry']} entry
   * @returns
   */
  setEntry(entry) {
    this._conf.entry = entry;
    return this;
  }

  prod() {
    this.setMode('production');
    return this;
  }

  dev() {
    this.setMode('development');
    return this;
  }

  isProd() {
    return this._conf.mode == 'production';
  }

  isDev() {
    return this._conf.mode == 'development';
  }

  /**
   *
   * @param {Config['mode']} mode
   * @returns
   */
  setMode(mode) {
    this._conf.mode = mode;
    return this;
  }

  setProp(propName, value) {
    this._conf[propName] = value;
    return this;
  }

  /**
   *
   * @param {boolean} bool
   */
  enableUglifyJs(bool) {
    this._uglifyJS = bool;
    return this;
  }

  /**
   *
   * @param {Config['devServer']} devServerConfig
   * @returns
   */
  setDevServer(devServerConfig) {
    this._conf.devServer = devServerConfig;
    return this;
  }

  setOutputFolder({ folderpath, current = true }) {
    this._conf.output.path = current ? path.resolve(__dirname, folderpath) : folderpath;
    return this;
  }

  setOutputFilename({ filename, js = true }) {
    this._conf.output.filename = js ? `${filename}.js` : filename;
    return this;
  }

  /**
   *
   * @param {UglifyJsPlugin.UglifyJsPluginOptions} uglifyParam
   * @returns
   */
  setUglifyJsPluginOptions(uglifyParam) {
    this.uglifyParam = uglifyParam;
    return this;
  }

  excludeFolder(folder) {
    this.excludedFolders.push(folder);
    return this;
  }

  excludeFolders(folders) {
    this.excludedFolders = [...this.excludedFolders, ...folders];
    return this;
  }

  /**
   *
   * @param {Config['module']['rules'][0]} rule
   * @returns
   */
  addModuleRule(rule) {
    this._conf.module.rules.push(rule);
    return this;
  }

  /**
   *
   * @param {Config['optimization']['minimizer'][0]} minimizer
   * @returns
   */
  addMinimiser(minimizer) {
    this._conf.optimization.minimizer.push(minimizer);
    return this;
  }

  /**
   *
   * @param {Config['plugins'][0]} plugin
   * @returns
   */
  addPlugin(plugin) {
    this._conf.plugins.push(plugin);
    return this;
  }

  /**
   *
   * @param {Config['plugins']} plugins
   * @returns
   */
  setPlugins(plugins) {
    this._conf.plugins = [...this._conf.plugins, ...plugins];
    return this;
  }

  /**
   *
   * @param {Config} conf
   * @returns
   */
  setRawConfig(conf) {
    this._conf = { ...this._conf, ...conf };
    return this;
  }

  /**
   *
   * @param {import("javascript-obfuscator/src/types/options/TInputOptions").TInputOptions} options
   * @returns
   */
  setObfuscator(options = {}) {
    this.addPlugin(
      new WebpackObfuscator({
        rotateStringArray: true,
        compact: true,
        // disableConsoleOutput: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: true,
        ...options,
      })
    );
    return this;
  }

  addHeader(header) {
    this._header_set = true;
    this._header = header;
    this.setBannerPlugin({
      banner: header,
    });
    return this;
  }

  setBannerPlugin(options = {}) {
    this.addPlugin(
      new webpack.BannerPlugin({
        banner: '',
        raw: true,
        entryOnly: true,
        ...options,
      })
    );
    return this;
  }

  setHotReloadDevServer({ watchPath, poll = 1000, port = 8080, quiet = false }) {
    this.setDevServer({
      port,
      contentBase: path.resolve(__dirname, watchPath),
      watchContentBase: true,
      watchOptions: {
        poll,
      },
      hot: true,
      quiet,
    });
    return this;
  }

  /**
   *
   * @param {HtmlWebpackPlugin.Options} config
   * @returns
   */
  setHtmlWebpackPlugin(config) {
    this.addPlugin(new HtmlWebpackPlugin(config));
    return this;
  }

  enableScopedCssLoader(bool) {
    this._scopedCssRule = bool;
    return this;
  }

  /**
   *
   * @callback PathCallback
   * @param {path.PlatformPath} path
   * @returns {Object.<string, any>}
   */

  /**
   *
   * @param {PathCallback} callback
   */
  setAlias(callback) {
    this._conf.resolve.alias = callback ? callback(path) || {} : {};
    return this;
  }

  /**
   *
   * @param {Config['resolve']['extensions']} extensions
   * @returns
   */
  resolveExtensions(extensions) {
    this._conf.resolve.extensions = extensions;
    return this;
  }

  /**
   *
   * @param {string} path
   */
  setAssetsOutputPath(path) {
    this._assetsPath = path;
  }

  /**
   *
   * @param {boolean} watch
   */
  setWatch(watch) {
    this._conf.watch = watch;
    return this;
  }

  /**
   *
   * @param {{poll:number, ignored:RegExp}} param0
   */
  setWatchOptions({ poll, ignored }) {
    this._conf.watchOptions.poll = poll;
    this._conf.watchOptions.ignored = ignored;
    return this;
  }

  /**
   *
   * @param {CopyPlugin.CopyPluginOptions} options
   */
  setCopyPluginOptions(options) {
    this.addPlugin(new CopyPlugin(options));
    return this;
  }

  build() {
    this.resolveExtensions(['.ts', '.js', '.tsx', '.jsx']);
    this.addModuleRule({
      test: /\.js(x)?$/,
      exclude: new RegExp(`(${this.excludedFolders.join('|')})`),
      use: {
        loader: 'babel-loader',
      },
    });
    this.addModuleRule({
      test: /\.ts(x)?$/,
      exclude: new RegExp(`(${this.excludedFolders.join('|')})`),
      use: 'ts-loader',
    });
    this.addModuleRule({
      test: /\.(sa|sc|c)ss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: false, // turned off as causes delay
            importLoaders: 2,
          },
        },
        ...(this._scopedCssRule ? ['scoped-css-loader'] : []),
        'sass-loader',
      ],
    });
    this.addModuleRule({
      test: /\.html$/,
      use: ['html-loader'],
    });
    this.addModuleRule({
      test: /\.(ico|png|svg|jpe?g|gif)$/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/images/[name].[hash][ext][query]',
      },
    });
    this.addModuleRule({
      test: /\.(mp4|mov|mpeg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/videos/[name].[hash][ext][query]',
      },
    });
    this.addModuleRule({
      test: /\.(wav|mp3|aac)$/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/audio/[name].[hash][ext][query]',
      },
    });
    if (this._uglifyJS) {
      this.addMinimiser(
        new UglifyJsPlugin({
          cache: true,
          ...this.uglifyParam,
          ...(this._header_set
            ? {
                uglifyOptions: {
                  ...(this.uglifyParam.uglifyOptions ? this.uglifyParam.uglifyOptions : {}),
                  output: {
                    beautify: false,
                    preamble: this._header,
                  },
                },
              }
            : {}),
        })
      );
    }
    return this._conf;
  }
}

module.exports = {
  WebpackBuilder,
};
