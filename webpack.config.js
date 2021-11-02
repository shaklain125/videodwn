const { name } = require("./package.json");
const { WebpackBuilder } = require("./webpack_builder");

/**
 *
 * @typedef {import("./webpack_builder").Config} Config
 */

/**
 *
 * @typedef {Object} DefaultConfigParam
 * @property {Config['entry']} filepath
 * @property {string} outputName
 * @property {Config['mode']} [mode]
 * @property {boolean} [watch]
 * @property {boolean} [uglify]
 */

/**
 *
 * @param {DefaultConfigParam} param0
 * @returns {WebpackBuilder}
 */
const default_conf = ({ filepath, outputName, mode, watch, uglify }) =>
	new WebpackBuilder()
		.setMode(mode ? mode : "production")
		.setWatch(watch)
		.setProp("devtool", watch ? "inline-source-map" : undefined)
		.enableUglifyJs(uglify)
		.setEntry(filepath)
		.setOutputFolder({ folderpath: "dist" })
		.setOutputFilename({ filename: outputName })
		.excludeFolders(["dist"])
		.setAlias(path => ({
			"@src": path.resolve(__dirname, "src"),
			"@base": path.resolve(__dirname),
		}));

/**
 *
 * @param {DefaultConfigParam} options
 * @returns {WebpackBuilder}
 */
const def_conf = options =>
	default_conf({
		...options,
		mode: options.watch ? "development" : "production",
		uglify: !options.watch,
	}).setOutputFolder({ folderpath: `dist/js` });

/**
 *
 * @param {DefaultConfigParam} options
 * @returns {Config}
 */
const popup_config = options =>
	def_conf(options)
		.setHtmlWebpackPlugin({
			inject: true,
			template: "./src/app/popup/index.html",
			filename: `../html/popup.html`,
		})
		.enableScopedCssLoader(true)
		.setCopyPluginOptions({
			patterns: [{ from: "./public/**/*", to: `../[name][ext]` }],
		})
		.build();

/**
 *
 * @param {DefaultConfigParam} options
 * @returns {Config}
 */
const options_config = options =>
	def_conf(options)
		.setHtmlWebpackPlugin({
			inject: true,
			template: "./src/app/options/index.html",
			filename: "../html/options.html",
		})
		.enableScopedCssLoader(true)
		.build();

/**
 *
 * @param {DefaultConfigParam} options
 * @returns {Config}
 */
const background_config = options => def_conf(options).build();

/**
 *
 * @param {DefaultConfigParam} options
 * @returns {Config}
 */
const content_script_config = options => def_conf(options).build();

/**
 * @param {boolean} watch
 * @returns returns a webpack configuration for a userscript.
 */
const build = watch => {
	return [
		popup_config({
			filepath: "./src/app/popup/index.tsx",
			outputName: `popup`,
			watch,
		}),
		options_config({
			filepath: "./src/app/options/index.tsx",
			outputName: `options`,
			watch,
		}),
		background_config({
			filepath: "./src/app/background/index.ts",
			outputName: `background`,
			watch,
		}),
		content_script_config({
			filepath: "./src/app/content_script/index.ts",
			outputName: `content_script`,
			watch,
		}),
	];
};

module.exports = env => {
	if ("build" in env) return build(false);
	if ("watch" in env) return build(true);
	return {};
};
