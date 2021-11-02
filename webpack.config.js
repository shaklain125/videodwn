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
const conf = options =>
	def_conf(options)
		.setHtmlWebpackPlugin({
			inject: true,
			template: "./src/app/popup/index.html",
			filename: `../html/popup.html`,
			excludeChunks: Object.keys(options.filepath).filter(v => v != "popup"),
		})
		.setHtmlWebpackPlugin({
			inject: true,
			template: "./src/app/options/index.html",
			filename: "../html/options.html",
			excludeChunks: Object.keys(options.filepath).filter(v => v != "options"),
		})
		.enableScopedCssLoader(true)
		.setCopyPluginOptions({
			patterns: [{ from: "./public/**/*", to: `../[name][ext]` }],
		})
		.build();

/**
 * @param {boolean} watch
 * @returns returns a webpack configuration for a userscript.
 */
const build = watch => {
	return [
		conf({
			filepath: {
				popup: "./src/app/popup/index.tsx",
				options: "./src/app/options/index.tsx",
				content_script: "./src/app/content_script/index.ts",
				background: "./src/app/background/index.ts",
			},
			outputName: "[name]",
			watch,
		}),
	];
};

module.exports = env => {
	if ("build" in env) return build(false);
	if ("watch" in env) return build(true);
	return {};
};
