const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin

const AutoprefixerPlugin = require('autoprefixer')

const config = {
    target: 'web',
    entry: {
        index: './src/lithosphere.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: path.resolve(__dirname, './dist') + '/',
        filename: 'lithosphere.js',
        library: 'LithoSphere',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true,
    },
    watchOptions: {
        aggregateTimeout: 600,
        ignored: /node_modules/,
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
            cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')],
        }),
        process.argv.includes('--analyze') ? new BundleAnalyzerPlugin() : null,
    ].filter(Boolean),
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: [/node_modules/, /test/],
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [AutoprefixerPlugin],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
}

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        // * add some development rules here
    } else if (argv.mode === 'production') {
        // * add some prod rules here
    } else {
        throw new Error('Specify env')
    }

    return config
}
