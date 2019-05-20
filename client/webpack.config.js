'use strict';

const path = require("path");
const webpack = require('webpack');

const HtmlPlugin = require('html-webpack-plugin');

const rootDir = path.join(__dirname, '.');
const config = {
    rootDir,
    out:            path.join(rootDir, "./dist/assets"),
    src:            path.join(rootDir, "./src"),

    isProduction:   process.env.NODE_ENV === 'production'
};

module.exports = {
    mode: config.isProduction ? 'production' : 'development',
    // stats: 'verbose',
    cache: false,
    node: {
        __dirname: false,
        __filename: false
    },
    devtool: 'source-map',
    resolve: {
        modules: [path.resolve(config.rootDir, 'src'), 'node_modules'],
        extensions: ['.js', '.jsx', '.json']
    },

    entry: {
        app: path.join(config.src, './index.js')
    },
    output: {
        path: config.out,
        filename: './[name].js'
    },
    target: 'web',

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            '@babel/preset-react',
                        ],
                        ignore: [ 'node_modules/**' ]
                    }
                }
            },

            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            },

            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                    }
                }]
            },
            {
                test: /\.(gif|png|jpe?g)$/,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                            outputPath: 'image/'
                        }
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },
    plugins: [
        new HtmlPlugin({ title: '', filename: '../index.html'}),
        !config.isProduction && new webpack.NamedModulesPlugin(),
    ].filter(Boolean),

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm/${packageName.replace('@', '')}`;
                    },
                },
            },
        },
    },
};
